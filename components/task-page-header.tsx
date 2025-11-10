'use client'

import { Task } from '@/lib/db/schema'
import { PageHeader } from '@/components/page-header'
import { TaskActions } from '@/components/task-actions'
import { useTasks } from '@/components/app-layout'
import { User } from '@/components/auth/user'
import { Button } from '@/components/ui/button'
import { VERCEL_DEPLOY_URL } from '@/lib/constants'
import type { Session } from '@/lib/session/types'
import { GitHubStarsButton } from '@/components/github-stars-button'

interface TaskPageHeaderProps {
  task: Task
  user: Session['user'] | null
  authProvider: Session['authProvider'] | null
  initialStars?: number
}

export function TaskPageHeader({ task, user, authProvider, initialStars = 1200 }: TaskPageHeaderProps) {
  const { toggleSidebar } = useTasks()

  return (
    <PageHeader
      showMobileMenu={true}
      onToggleMobileMenu={toggleSidebar}
      showPlatformName={true}
      actions={
        <div className="flex items-center gap-2">
          <TaskActions task={task} />
          <User user={user} authProvider={authProvider} />
        </div>
      }
    />
  )
}
