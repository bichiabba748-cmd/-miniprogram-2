const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    courses: [],
    showModal: false,
    isEdit: false,
    editingId: null,
    form: {
      title: '',
      category: '',
      categoryIndex: 0,
      author: '',
      minutes: '',
      seconds: '',
      mediaUrl: '',
      coverUrl: '',
      description: '',
      badge: ''
    },
    categories: [
      '文案创作',
      '视频剪辑',
      '直播运营',
      '账号起号',
      'IP打造',
      '社区型账号打造',
      '文案改写',
      'AI应用'
    ]
  },

  onLoad() {
    this.loadCourses();
  },

  loadCourses() {
    wx.showLoading({ title: '加载中...' });
    
    db.collection('courses')
      .orderBy('createdAt', 'desc')
      .get()
      .then(res => {
        this.setData({ courses: res.data });
        wx.hideLoading();
      })
      .catch(err => {
        console.error('加载课程失败：', err);
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  onAddCourse() {
    this.setData({
      showModal: true,
      isEdit: false,
      editingId: null,
      form: {
        title: '',
        category: '',
        categoryIndex: 0,
        author: '',
        minutes: '',
        seconds: '',
        mediaUrl: '',
        coverUrl: '',
        description: '',
        badge: ''
      }
    });
  },

  onEditCourse(e) {
    const id = e.currentTarget.dataset.id;
    const course = this.data.courses.find(c => c.id === id);
    
    if (!course) return;
    
    const durationParts = course.duration.split(':');
    const minutes = durationParts[0] || '';
    const seconds = durationParts[1] || '';
    
    this.setData({
      showModal: true,
      isEdit: true,
      editingId: id,
      form: {
        title: course.title || '',
        category: course.category || '',
        categoryIndex: this.data.categories.indexOf(course.category) || 0,
        author: course.author || '',
        minutes: minutes,
        seconds: seconds,
        mediaUrl: course.mediaUrl || '',
        coverUrl: course.coverUrl || '',
        description: course.description || '',
        badge: course.badge || ''
      }
    });
  },

  onCloseModal() {
    this.setData({ showModal: false });
  },

  onTitleInput(e) {
    this.setData({ 'form.title': e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      'form.categoryIndex': index,
      'form.category': this.data.categories[index]
    });
  },

  onAuthorInput(e) {
    this.setData({ 'form.author': e.detail.value });
  },

  onMinutesInput(e) {
    this.setData({ 'form.minutes': e.detail.value });
  },

  onSecondsInput(e) {
    this.setData({ 'form.seconds': e.detail.value });
  },

  onMediaUrlInput(e) {
    this.setData({ 'form.mediaUrl': e.detail.value });
  },

  onDescriptionInput(e) {
    this.setData({ 'form.description': e.detail.value });
  },

  onBadgeInput(e) {
    this.setData({ 'form.badge': e.detail.value });
  },

  onChooseCover() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.uploadCover(tempFilePaths[0]);
      }
    });
  },

  uploadCover(filePath) {
    wx.showLoading({ title: '上传中...' });
    
    wx.cloud.uploadFile({
      cloudPath: `courses/${Date.now()}.jpg`,
      filePath: filePath,
      success: (res) => {
        this.setData({ 'form.coverUrl': res.fileID });
        wx.hideLoading();
      },
      fail: (err) => {
        console.error('上传失败：', err);
        wx.hideLoading();
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  },

  onSaveCourse() {
    const { form, isEdit, editingId } = this.data;
    
    if (!form.title) {
      wx.showToast({ title: '请输入课程标题', icon: 'none' });
      return;
    }
    
    if (!form.category) {
      wx.showToast({ title: '请选择课程分类', icon: 'none' });
      return;
    }
    
    if (!form.minutes || !form.seconds) {
      wx.showToast({ title: '请输入课程时长', icon: 'none' });
      return;
    }
    
    const duration = `${form.minutes}:${form.seconds}`;
    
    wx.showLoading({ title: '保存中...' });
    
    const courseData = {
      title: form.title,
      category: form.category,
      author: form.author || '未知',
      duration: duration,
      mediaUrl: form.mediaUrl || '',
      coverUrl: form.coverUrl || '',
      description: form.description || '',
      badge: form.badge || '',
      mediaType: 'link',
      status: 'published',
      view: 0,
      updatedAt: db.serverDate()
    };
    
    if (isEdit && editingId) {
      db.collection('courses')
        .where({ id: editingId })
        .update({
          data: courseData
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({ title: '保存成功', icon: 'success' });
          this.onCloseModal();
          this.loadCourses();
        })
        .catch(err => {
          console.error('更新失败：', err);
          wx.hideLoading();
          wx.showToast({ title: '保存失败', icon: 'none' });
        });
    } else {
      const newId = Date.now();
      db.collection('courses')
        .add({
          data: {
            ...courseData,
            id: newId,
            createdAt: db.serverDate()
          }
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({ title: '添加成功', icon: 'success' });
          this.onCloseModal();
          this.loadCourses();
        })
        .catch(err => {
          console.error('添加失败：', err);
          wx.hideLoading();
          wx.showToast({ title: '添加失败', icon: 'none' });
        });
    }
  }
});
