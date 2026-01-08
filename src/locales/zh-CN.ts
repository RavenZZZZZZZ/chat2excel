// ==============================================================================
// locales/zh-CN.ts - 简体中文翻译
// ==============================================================================
//
// 本文件包含应用的所有简体中文翻译
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
    // ==================== 通用 ====================
    common: {
      appName: 'Chat2Excel',
      loading: '加载中...',
      save: '保存',
      delete: '删除',
      export: '导出',
      cancel: '取消',
      confirm: '确认',
      back: '返回',
      next: '下一步',
      done: '完成',
      close: '关闭',
      retry: '重试',
    },

    // ==================== 导航 ====================
    nav: {
      home: '首页',
      help: '帮助',
    },

    // ==================== 首页 ====================
    home: {
      title: 'Chat2Excel - 表格 OCR 识别',
      subtitle: '上传表格图片，自动识别并导出 Excel',
      startRecognition: '开始识别',
      uploadedCount: '已上传的图片 ({{count}})',
      dropZone: {
        title: '拖拽图片到这里，或点击选择',
        subtitle: '支持 JPG、PNG、WEBP、GIF 格式，最大 7MB',
      },
    },

    // ==================== 上传组件 ====================
    upload: {
      uploading: '正在上传...',
      processing: '正在处理...',
      success: '上传成功',
      failed: '上传失败',
      remove: '移除',
      retry: '重试',
      errors: {
        tooLarge: '文件大小超过限制（最大 {{size}}MB）',
        invalidType: '不支持的文件格式',
        uploadFailed: '上传失败，请重试',
      },
    },

    // ==================== 识别页面 ====================
    recognizing: {
      title: '正在识别中...',
      subtitle: '请稍候，正在提取图片中的文字',
      completed: '识别完成',
      completedSubtitle: '所有图片识别完成，查看结果下方',
      progress: '进度: {{progress}}%',
      status: {
        pending: '等待中',
        processing: '识别中',
        completed: '已完成',
        failed: '失败',
      },
      result: {
        success: '识别成功',
        failed: '识别失败',
        confidence: '置信度: {{confidence}}%',
        duration: '耗时: {{duration}}秒',
      },
    },

    // ==================== 编辑页面 ====================
    editing: {
      title: '编辑表格',
      subtitle: '查看和编辑识别结果',
      exportCurrent: '导出 Excel',
      exportAll: '导出所有表格',
      downloadExcel: '下载 Excel',
      copyMarkdown: '复制 Markdown',
      copySuccess: '已复制到剪贴板',
      copyFailed: '复制失败',
      tableCount: '共 {{count}} 个表格',
      currentTable: '表格 {{current}} / {{total}}',
      previous: '上一个',
      next: '下一个',
      originalImage: '原始图片',
      parsedResult: '解析结果',
      showImage: '显示原图',
      hideImage: '隐藏原图',
    },

    // ==================== 导出功能 ====================
    export: {
      title: '导出 Excel',
      filename: '文件名',
      selectFormat: '选择格式',
      formats: {
        xlsx: 'Excel (.xlsx)',
        csv: 'CSV (.csv)',
        markdown: 'Markdown (.md)',
      },
      downloading: '正在下载...',
      success: '导出成功',
      failed: '导出失败',
    },

    // ==================== 帮助页面 ====================
    help: {
      title: '使用帮助',
      subtitle: '如何使用 Chat2Excel',
      sections: {
        overview: {
          title: '功能概述',
          content: 'Chat2Excel 是一个基于 OCR 的表格识别工具，可以自动提取图片中的表格并导出为 Excel。',
        },
        howToUse: {
          title: '使用方法',
          steps: {
            1: '上传表格图片',
            2: '等待 OCR 识别',
            3: '查看和编辑结果',
            4: '导出 Excel',
          },
        },
        supportedFormats: {
          title: '支持的图片格式',
          formats: 'JPG、PNG、WEBP、GIF',
        },
        tips: {
          title: '使用技巧',
          tips: {
            clear: '确保图片清晰，表格边框明显',
            light: '光线充足，避免阴影',
            complete: '确保表格完整，不要被裁剪',
          },
        },
      },
    },

    // ==================== 错误消息 ====================
    errors: {
      networkError: '网络错误，请检查连接',
      uploadFailed: '上传失败，请重试',
      ocrFailed: '识别失败，请重试',
      parseFailed: '解析失败，请重试',
      unknown: '未知错误',
      tryAgain: '请稍后重试',
      contactSupport: '如问题持续，请联系技术支持',
    },

    // ==================== 状态消息 ====================
    status: {
      success: '操作成功',
      failed: '操作失败',
      warning: '警告',
      info: '提示',
    },
  },
};
