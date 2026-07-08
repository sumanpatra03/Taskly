import { SettingsLayout } from '../SettingsLayout';
import { CustomFields } from './CustomFields';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function CustomFieldsSettingsPage({ params }: Props) {
  const { projectId } = await params;

  return (
    <SettingsLayout title="Custom Field Settings">
      <CustomFields projectId={projectId} />
    </SettingsLayout>
  );
}
