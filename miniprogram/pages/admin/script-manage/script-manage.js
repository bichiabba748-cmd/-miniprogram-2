const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    scripts: [],
    showModal: false,
    showDetailModal: false,
    isEdit: false,
    editingId: null,
    currentScript: null,
    filterCategory: '',
    filterStatus: '',
    filterCategoryText: '全部',
    filterStatusText: '全部',
    form: {
      title: '',
      category: '',
      categoryIndex: 0,
      scene: '',
      tags: '',
      durationMin: 3,
      opening: '',
      painPoints: '',
      valuePoints: '',
      interaction: '',
      cta: '',
      notes: '',
      status: 'published',
      statusIndex: 0,
      sort: 0
    },
    categories: [
      { key: 'daily_hot', name: '每日热点' },
      { key: 'school_zone', name: '学区房专题' },
      { key: 'listing_intro', name: '房源讲解' },
      { key: 'deal_story', name: '成交故事' },
      { key: 'avoid_pit', name: '避坑科普' }
    ],
    statusOptions: [
      { key: 'draft', name: '草稿' },
      { key: 'published', name: '已发布' },
      { key: 'archived', name: '已归档' }
    ]
  },

  onLoad() {
    this.loadScripts();
  },

  getCategoryName(key) {
    const cat = this.data.categories.find(c => c.key === key);
    return cat ? cat.name : key;
  },

  getStatusName(key) {
    const status = this.data.statusOptions.find(s => s.key === key);
    return status ? status.name : key;
  },

  loadScripts() {
    wx.showLoading({ title: '加载中...' });
    
    let query = db.collection('script_templates');
    
    if (this.data.filterCategory) {
      query = query.where({ category: this.data.filterCategory });
    }
    
    if (this.data.filterStatus) {
      query = query.where({ status: this.data.filterStatus });
    }
    
    query
      .orderBy('sort', 'desc')
      .orderBy('createdAt', 'desc')
      .get()
      .then(res => {
        const scripts = res.data.map(s => ({
          ...s,
          categoryName: this.getCategoryName(s.category),
          statusName: this.getStatusName(s.status)
        }));
        this.setData({ scripts });
        wx.hideLoading();
      })
      .catch(err => {
        console.error('[脚本管理] 加载失败：', err);
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  onFilterCategory(e) {
    const index = e.detail.value;
    const category = index === 0 ? '' : this.data.categories[index - 1].key;
    const categoryText = index === 0 ? '全部' : this.data.categories[index - 1].name;
    this.setData({ filterCategory: category, filterCategoryText: categoryText }, () => {
      this.loadScripts();
    });
  },

  onFilterStatus(e) {
    const index = e.detail.value;
    const status = index === 0 ? '' : this.data.statusOptions[index - 1].key;
    const statusText = index === 0 ? '全部' : this.data.statusOptions[index - 1].name;
    this.setData({ filterStatus: status, filterStatusText: statusText }, () => {
      this.loadScripts();
    });
  },

  onAddScript() {
    this.setData({
      showModal: true,
      isEdit: false,
      editingId: null,
      form: {
        title: '',
        category: 'daily_hot',
        categoryIndex: 0,
        scene: '',
        tags: '',
        durationMin: 3,
        opening: '',
        painPoints: '',
        valuePoints: '',
        interaction: '',
        cta: '',
        notes: '',
        status: 'published',
        statusIndex: 1,
        sort: 0
      }
    });
  },

  onEditScript(e) {
    const id = e.currentTarget.dataset.id;
    const script = this.data.scripts.find(s => s._id === id);
    
    if (!script) return;
    
    this.setData({
      showModal: true,
      isEdit: true,
      editingId: id,
      form: {
        title: script.title || '',
        category: script.category || 'daily_hot',
        categoryIndex: this.data.categories.findIndex(c => c.key === script.category) || 0,
        scene: script.scene || '',
        tags: (script.tags || []).join(','),
        durationMin: script.durationMin || 3,
        opening: script.content?.opening || '',
        painPoints: (script.content?.painPoints || []).join('\n'),
        valuePoints: (script.content?.valuePoints || []).join('\n'),
        interaction: (script.content?.interaction || []).join('\n'),
        cta: script.content?.cta || '',
        notes: script.content?.notes || '',
        status: script.status || 'published',
        statusIndex: this.data.statusOptions.findIndex(s => s.key === script.status) || 1,
        sort: script.sort || 0
      }
    });
  },

  onViewScript(e) {
    const id = e.currentTarget.dataset.id;
    const script = this.data.scripts.find(s => s._id === id);
    if (script) {
      this.setData({
        showDetailModal: true,
        currentScript: script
      });
    }
  },

  onToggleStatus(e) {
    const id = e.currentTarget.dataset.id;
    const script = this.data.scripts.find(s => s._id === id);
    
    if (!script) return;
    
    const newStatus = script.status === 'published' ? 'archived' : 'published';
    const statusName = newStatus === 'published' ? '发布' : '下架';
    
    wx.showModal({
      title: '确认操作',
      content: `确定要${statusName}这个脚本吗？`,
      success: (res) => {
        if (res.confirm) {
          db.collection('script_templates')
            .doc(id)
            .update({
              data: {
                status: newStatus,
                updatedAt: db.serverDate()
              }
            })
            .then(() => {
              wx.showToast({ title: `${statusName}成功`, icon: 'success' });
              this.loadScripts();
            })
            .catch(err => {
              console.error('[脚本管理] 更新状态失败：', err);
              wx.showToast({ title: '操作失败', icon: 'none' });
            });
        }
      }
    });
  },

  onDeleteScript(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个脚本吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          db.collection('script_templates')
            .doc(id)
            .remove()
            .then(() => {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadScripts();
            })
            .catch(err => {
              console.error('[脚本管理] 删除失败：', err);
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  onCloseModal() {
    this.setData({ showModal: false });
  },

  onCloseDetailModal() {
    this.setData({ showDetailModal: false, currentScript: null });
  },

  onTitleInput(e) {
    this.setData({ 'form.title': e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      'form.categoryIndex': index,
      'form.category': this.data.categories[index].key
    });
  },

  onSceneInput(e) {
    this.setData({ 'form.scene': e.detail.value });
  },

  onTagsInput(e) {
    this.setData({ 'form.tags': e.detail.value });
  },

  onDurationInput(e) {
    this.setData({ 'form.durationMin': parseInt(e.detail.value) || 3 });
  },

  onOpeningInput(e) {
    this.setData({ 'form.opening': e.detail.value });
  },

  onPainPointsInput(e) {
    this.setData({ 'form.painPoints': e.detail.value });
  },

  onValuePointsInput(e) {
    this.setData({ 'form.valuePoints': e.detail.value });
  },

  onInteractionInput(e) {
    this.setData({ 'form.interaction': e.detail.value });
  },

  onCtaInput(e) {
    this.setData({ 'form.cta': e.detail.value });
  },

  onNotesInput(e) {
    this.setData({ 'form.notes': e.detail.value });
  },

  onStatusChange(e) {
    const index = e.detail.value;
    this.setData({
      'form.statusIndex': index,
      'form.status': this.data.statusOptions[index].key
    });
  },

  onSortInput(e) {
    this.setData({ 'form.sort': parseInt(e.detail.value) || 0 });
  },

  onSaveScript() {
    const { form, isEdit, editingId } = this.data;
    
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入脚本标题', icon: 'none' });
      return;
    }
    
    if (!form.scene.trim()) {
      wx.showToast({ title: '请输入适用场景', icon: 'none' });
      return;
    }
    
    if (!form.opening.trim()) {
      wx.showToast({ title: '请输入开场白', icon: 'none' });
      return;
    }
    
    const scriptData = {
      title: form.title.trim(),
      category: form.category,
      scene: form.scene.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
      durationMin: form.durationMin,
      content: {
        opening: form.opening.trim(),
        painPoints: form.painPoints.split('\n').map(p => p.trim()).filter(p => p),
        valuePoints: form.valuePoints.split('\n').map(v => v.trim()).filter(v => v),
        interaction: form.interaction.split('\n').map(i => i.trim()).filter(i => i),
        cta: form.cta.trim(),
        notes: form.notes.trim()
      },
      status: form.status,
      sort: form.sort,
      version: '1.0',
      updatedAt: db.serverDate()
    };
    
    wx.showLoading({ title: '保存中...' });
    
    if (isEdit && editingId) {
      db.collection('script_templates')
        .doc(editingId)
        .update({
          data: scriptData
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({ title: '保存成功', icon: 'success' });
          this.onCloseModal();
          this.loadScripts();
        })
        .catch(err => {
          console.error('[脚本管理] 更新失败：', err);
          wx.hideLoading();
          wx.showToast({ title: '保存失败', icon: 'none' });
        });
    } else {
      const newId = Date.now();
      db.collection('script_templates')
        .add({
          data: {
            ...scriptData,
            id: newId,
            createdAt: db.serverDate()
          }
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({ title: '添加成功', icon: 'success' });
          this.onCloseModal();
          this.loadScripts();
        })
        .catch(err => {
          console.error('[脚本管理] 添加失败：', err);
          wx.hideLoading();
          wx.showToast({ title: '添加失败', icon: 'none' });
        });
    }
  },

  onInitScripts() {
    wx.showModal({
      title: '初始化脚本数据',
      content: '确定要初始化脚本模板数据吗？这将插入10条示例脚本。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          wx.cloud.callFunction({
            name: 'init_script_templates',
            data: {
              role: 'admin'
            },
            success: (result) => {
              wx.hideLoading();
              console.log('[脚本管理] 初始化结果:', result);
              if (result.result.code === 0) {
                wx.showToast({ title: '初始化成功', icon: 'success' });
                this.loadScripts();
              } else {
                wx.showToast({ title: result.result.message || '初始化失败', icon: 'none' });
              }
            },
            fail: (err) => {
              console.error('[脚本管理] 初始化失败：', err);
              wx.hideLoading();
              if (err.errMsg.includes('FunctionName parameter could not be found')) {
                wx.showToast({ title: '云函数未部署，请先部署云函数', icon: 'none' });
              } else {
                wx.showToast({ title: '初始化失败', icon: 'none' });
              }
            }
          });
        }
      }
    });
  }
});