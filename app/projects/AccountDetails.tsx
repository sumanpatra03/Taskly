'use client';

import { ProfilePhotoUploader } from '@/components/ProfilePhotoUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { users, type IUser } from '@/utils/users';
import { ExternalLink, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { secondaryBtnStyles } from '../commonStyles';

interface AccountDetailsProps {
  initialData: IUser;
}

export const AccountDetails = ({ initialData }: AccountDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<IUser>(initialData);
  const [formData, setFormData] = useState({
    name: initialData.name,
    description: initialData.description || '',
    links: initialData.links?.length
      ? initialData.links
      : [{ id: '', label: '', url: '' }],
  });
  const { toast } = useToast();

  const handleSave = async () => {
    if (!userData) return;

    try {
      setIsSaving(true);
      await users.updateProfile(userData.id, {
        name: formData.name,
        description: formData.description,
        links: formData.links.filter((link) => link.label && link.url),
      });

      setUserData({ ...userData, ...formData });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { id: '', label: '', url: '' }],
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, index) =>
        index === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.03)] backdrop-blur-md w-full flex flex-col gap-4">
      <ProfilePhotoUploader
        currentPhotoUrl={userData.avatar}
        userProvider={userData.provider}
        onPhotoUploaded={async (url) => {
          if (!userData) return;
          await users.updateProfile(userData.id, { avatar: url });
          setUserData({ ...userData, avatar: url });
        }}
      />

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Your name"
              className="h-8.5 text-xs mt-1 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bio</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Tell us about yourself"
              className="resize-none text-xs mt-1 h-20 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Links</label>
            {formData.links.map((link, index) => (
              <div key={index} className="flex gap-1.5 mt-1.5">
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  className="w-[100px] h-8.5 text-xs bg-white dark:bg-slate-950"
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  className="h-8.5 text-xs bg-white dark:bg-slate-950"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(index)}
                  className="text-red-500 hover:text-red-600 h-8.5 w-8.5 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLink}
              className="mt-2 h-7 px-2.5 text-xs"
            >
              Add Link
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className={cn(secondaryBtnStyles, 'h-8 px-4 text-xs')}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="h-8 px-3 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{userData.name}</h1>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {userData.email}
            </div>
          </div>
          
          {userData.description && (
            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850/40">
              {userData.description}
            </p>
          )}

          {userData.links && userData.links.length > 0 && (
            <div className="space-y-2 pt-1">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Links</h2>
              <div className="flex flex-wrap gap-1.5">
                {userData.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40 transition-colors"
                  >
                    <LinkIcon className="w-3 h-3 text-slate-400" />
                    <span>{link.label}</span>
                    <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => setIsEditing(true)}
            className={cn(secondaryBtnStyles, 'w-full h-8.5 text-xs font-semibold mt-2')}
          >
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
};
