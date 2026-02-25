/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*/icon/Icon' {
  import type { DefineComponent } from 'vue'
  export const FileIconDefault: DefineComponent<{}, {}, any>
  export const AddIcon: DefineComponent<{}, {}, any>
  export const DeleteIcon: DefineComponent<{}, {}, any>
  export const DragIcon: DefineComponent<{}, {}, any>
  export const SearchIcon: DefineComponent<{}, {}, any>
  export const ClearIcon: DefineComponent<{}, {}, any>
  export const EditIcon: DefineComponent<{}, {}, any>
  export const EditIconNotepad: DefineComponent<{}, {}, any>
  export const EditIconPen: DefineComponent<{}, {}, any>
  export const CrossIcon: DefineComponent<{}, {}, any>
  export const InfoIcon: DefineComponent<{}, {}, any>
  export const InfoIconWithTooltip: DefineComponent<{}, {}, any>
  export const SuccessIcon: DefineComponent<{}, {}, any>
  export const ErrorIcon: DefineComponent<{}, {}, any>
  export const UploadIcon: DefineComponent<{}, {}, any>
  export const BackIcon: DefineComponent<{}, {}, any>
  export const ForwardIcon: DefineComponent<{}, {}, any>
  export const UpIcon: DefineComponent<{}, {}, any>
  export const DownIcon: DefineComponent<{}, {}, any>
  export const EyeIcon: DefineComponent<{}, {}, any>
  export const EyeOffIcon: DefineComponent<{}, {}, any>
  export const FolderIcon: DefineComponent<{}, {}, any>
  export const PlusIcon: DefineComponent<{}, {}, any>
  export const MinusIcon: DefineComponent<{}, {}, any>
  export const SpinningCircle: DefineComponent<{}, {}, any>
  export const RefreshIcon: DefineComponent<{}, {}, any>
}

