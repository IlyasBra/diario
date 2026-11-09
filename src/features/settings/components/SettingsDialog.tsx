import { Dialog } from '@/components/ui/Dialog'

import { type ThemePreference } from '../theme'
import { BackupSection } from './BackupSection'
import { ThemeSection } from './ThemeSection'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  theme: { preference: ThemePreference; onChange: (preference: ThemePreference) => void }
  /** Whether the browser promised not to evict the data (null = unknown). */
  isStoragePersistent: boolean | null
}

export function SettingsDialog({ open, onClose, theme, isStoragePersistent }: SettingsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Ajustes">
      <div className="space-y-8">
        <ThemeSection preference={theme.preference} onChange={theme.onChange} />
        <BackupSection isStoragePersistent={isStoragePersistent} />
      </div>
    </Dialog>
  )
}
