export type ActivityStatus = '进行中' | '待发布' | '草稿' | '已结束'
export type DeviceScope = 'PC + H5' | '仅 PC' | '仅 H5'
export type ModuleType =
  | 'background'
  | 'banner'
  | 'navigation'
  | 'exchange'
  | 'sign'
  | 'task'
  | 'lottery'
  | 'invite'
  | 'community'
  | 'event'
  | 'rules'

export interface ActivityRecord {
  id: number
  name: string
  code: string
  template: string
  owner: string
  status: ActivityStatus
  device: DeviceScope
  startTime: string
  endTime: string
  updatedAt: string
  modules: number
  users: string
}

export interface ActivityModule {
  id: string
  type: ModuleType
  name: string
  description: string
  enabled: boolean
  device: DeviceScope
  warning?: string
}

export interface UploadedImageAsset {
  name: string
  size: string
  url: string
}

export interface NavigationMenuEntry {
  id: string
  label: string
  inactiveImage: UploadedImageAsset | null
  activeImage: UploadedImageAsset | null
}

export interface TaskRecord {
  id: number
  name: string
  executor: string
  cycle: string
  target: number
  reward: string
  condition: string
  enabled: boolean
}

export interface PrizeRecord {
  id: number
  name: string
  pool: string
  type: string
  probability: string
  stock: number
  limit: number
  status: string
}

export interface NavigationItem {
  id: string
  label: string
  icon: string
  badge?: string
}
