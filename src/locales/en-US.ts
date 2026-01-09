// ==============================================================================
// locales/en-US.ts - 英文翻译
// ==============================================================================
//
// 本文件包含应用的所有英文翻译
//
// 翻译组织结构：
// - common: 通用文本（按钮、标签等）
// - nav: 导航菜单
// - home: 首页
// - upload: 上传组件
// - recognizing: 识别页面
// - editing: 编辑页面
// - errors: 错误消息
//
// ==============================================================================

export default {
  translation: {
    // ==================== Common ====================
    common: {
      appName: 'Chat2Excel',
      loading: 'Loading...',
      save: 'Save',
      delete: 'Delete',
      export: 'Export',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      close: 'Close',
      retry: 'Retry',
    },

    // ==================== Navigation ====================
    nav: {
      home: 'Home',
      help: 'Help',
    },

    // ==================== Theme ====================
    theme: {
      toggle: 'Toggle theme',
      light: 'Light mode',
      dark: 'Dark mode',
    },

    // ==================== Home ====================
    home: {
      title: 'Chat2Excel - Table OCR Recognition',
      subtitle: 'Upload table images, auto-recognize and export to Excel',
      startRecognition: 'Start Recognition',
      uploadedCount: 'Uploaded Images ({{count}})',
      dropZone: {
        title: 'Drag images here, or click to select',
        subtitle: 'Supports JPG, PNG, WEBP, GIF formats, max 7MB',
      },
    },

    // ==================== Upload ====================
    upload: {
      uploading: 'Uploading...',
      processing: 'Processing...',
      success: 'Upload successful',
      failed: 'Upload failed',
      remove: 'Remove',
      retry: 'Retry',
      errors: {
        tooLarge: 'File size exceeds limit (max {{size}}MB)',
        invalidType: 'Unsupported file format',
        uploadFailed: 'Upload failed, please retry',
      },
    },

    // ==================== Recognizing ====================
    recognizing: {
      title: 'Recognizing...',
      subtitle: 'Please wait, extracting text from images',
      completed: 'Recognition Complete',
      completedSubtitle: 'All images processed, view results below',
      progress: 'Progress: {{progress}}%',
      status: {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        failed: 'Failed',
      },
      result: {
        success: 'Recognition successful',
        failed: 'Recognition failed',
        confidence: 'Confidence: {{confidence}}%',
        duration: 'Duration: {{duration}}s',
      },
    },

    // ==================== Editing ====================
    editing: {
      title: 'Edit Table',
      subtitle: 'View and edit recognition results',
      exportCurrent: 'Export Excel',
      exportAll: 'Export All Tables',
      downloadExcel: 'Download Excel',
      copyMarkdown: 'Copy Markdown',
      copySuccess: 'Copied to clipboard',
      copyFailed: 'Copy failed',
      tableCount: 'Total {{count}} tables',
      currentTable: 'Table {{current}} / {{total}}',
      previous: 'Previous',
      next: 'Next',
      originalImage: 'Original Image',
      parsedResult: 'Parsed Result',
      showImage: 'Show Image',
      hideImage: 'Hide Image',
    },

    // ==================== Export ====================
    export: {
      title: 'Export Excel',
      filename: 'Filename',
      selectFormat: 'Select Format',
      formats: {
        xlsx: 'Excel (.xlsx)',
        csv: 'CSV (.csv)',
        markdown: 'Markdown (.md)',
      },
      downloading: 'Downloading...',
      success: 'Export successful',
      failed: 'Export failed',
    },

    // ==================== Help ====================
    help: {
      title: 'Help',
      subtitle: 'How to use Chat2Excel',
      sections: {
        overview: {
          title: 'Overview',
          content: 'Chat2Excel is an OCR-based table recognition tool that automatically extracts tables from images and exports them to Excel.',
        },
        howToUse: {
          title: 'How to Use',
          steps: {
            1: 'Upload table images',
            2: 'Wait for OCR recognition',
            3: 'View and edit results',
            4: 'Export to Excel',
          },
        },
        supportedFormats: {
          title: 'Supported Image Formats',
          formats: 'JPG, PNG, WEBP, GIF',
        },
        tips: {
          title: 'Tips',
          tips: {
            clear: 'Ensure images are clear with visible table borders',
            light: 'Adequate lighting, avoid shadows',
            complete: 'Ensure tables are complete and not cropped',
          },
        },
      },
    },

    // ==================== Errors ====================
    errors: {
      networkError: 'Network error, please check connection',
      uploadFailed: 'Upload failed, please retry',
      ocrFailed: 'Recognition failed, please retry',
      parseFailed: 'Parsing failed, please retry',
      unknown: 'Unknown error',
      tryAgain: 'Please try again later',
      contactSupport: 'If the problem persists, please contact support',
    },

    // ==================== Status ====================
    status: {
      success: 'Success',
      failed: 'Failed',
      warning: 'Warning',
      info: 'Info',
    },
  },
};
