const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    stores: [],
    showModal: false,
    isEdit: false,
    currentStoreId: '',
    searchKeyword: '',
    formData: {
      name: '',
      code: '',
      address: '',
      managerName: '',
      phone: '',
      status: 'active'
    },
    // 模拟数据，用于测试
    mockStores: [
      {
        _id: '1',
        name: '河西一店',
        code: 'HX001',
        address: '天津市河西区南京路123号',
        managerId: 'admin_001',
        managerName: '王经理',
        phone: '13800138001',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: '和平二店',
        code: 'HP002',
        address: '天津市和平区和平路456号',
        managerId: 'admin_002',
        managerName: '李经理',
        phone: '13900139001',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '3',
        name: '南开三店',
        code: 'NK003',
        address: '天津市南开区南门外大街789号',
        managerId: 'admin_003',
        managerName: '张经理',
        phone: '13700137001',
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },

  onLoad() {
    // 页面加载时获取门店列表
    this.loadStores();
  },

  onShow() {
    // 页面显示时刷新门店列表
    this.loadStores();
  },

  // 加载门店列表
  loadStores() {
    wx.showLoading({ title: '加载中...' });

    // 模拟数据加载
    setTimeout(() => {
      this.setData({
        stores: this.data.mockStores
      });
      wx.hideLoading();
    }, 500);

    // 实际云函数调用代码（预留）
    /*
    wx.cloud.callFunction({
      name: 'getStores',
      data: {
        keyword: this.data.searchKeyword
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        this.setData({
          stores: res.result.data.stores
        });
      }
      wx.hideLoading();
    })
    .catch(err => {
      console.error('获取门店列表失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
    */
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索
  onSearch() {
    this.loadStores();
  },

  // 查看门店详情
  viewStoreDetail(e) {
    const storeId = e.currentTarget.dataset.id;
    wx.showToast({ title: '详情功能开发中', icon: 'none' });
  },

  // 创建门店
  createStore() {
    this.setData({
      showModal: true,
      isEdit: false,
      currentStoreId: '',
      formData: {
        name: '',
        code: '',
        address: '',
        managerName: '',
        phone: '',
        status: 'active'
      }
    });
  },

  // 编辑门店
  editStore(e) {
    const storeId = e.currentTarget.dataset.id;
    const store = this.data.stores.find(s => s._id === storeId);
    
    if (store) {
      this.setData({
        showModal: true,
        isEdit: true,
        currentStoreId: storeId,
        formData: {
          name: store.name,
          code: store.code,
          address: store.address,
          managerName: store.managerName,
          phone: store.phone,
          status: store.status
        }
      });
    }
  },

  // 删除门店
  deleteStore(e) {
    const storeId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认停用',
      content: '确定要停用这个门店吗？停用后可以重新启用。',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          // 模拟删除操作
          setTimeout(() => {
            const updatedStores = this.data.stores.map(store => {
              if (store._id === storeId) {
                return { ...store, status: 'inactive' };
              }
              return store;
            });
            
            this.setData({ stores: updatedStores });
            wx.hideLoading();
            wx.showToast({ title: '门店已停用', icon: 'success' });
          }, 500);

          // 实际云函数调用代码（预留）
          /*
          wx.cloud.callFunction({
            name: 'deleteStore',
            data: { storeId }
          })
          .then(res => {
            if (res.result && res.result.code === 0) {
              this.loadStores();
              wx.showToast({ title: '门店已停用', icon: 'success' });
            }
            wx.hideLoading();
          })
          .catch(err => {
            console.error('停用门店失败:', err);
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          });
          */
        }
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  // 状态选择
  onStatusChange(e) {
    const statusIndex = e.detail.value;
    this.setData({
      'formData.status': statusIndex === '0' ? 'active' : 'inactive'
    });
  },

  // 提交表单
  submitForm() {
    const { name, code, address, managerName, phone } = this.data.formData;
    
    if (!name || !code || !address || !managerName || !phone) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '处理中...' });

    // 模拟提交操作
    setTimeout(() => {
      if (this.data.isEdit) {
        // 编辑操作
        const updatedStores = this.data.stores.map(store => {
          if (store._id === this.data.currentStoreId) {
            return { ...store, ...this.data.formData, updatedAt: new Date() };
          }
          return store;
        });
        this.setData({ stores: updatedStores });
        wx.showToast({ title: '门店信息已更新', icon: 'success' });
      } else {
        // 创建操作
        const newStore = {
          _id: String(Date.now()),
          ...this.data.formData,
          managerId: 'admin_001',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const updatedStores = [newStore, ...this.data.stores];
        this.setData({ stores: updatedStores });
        wx.showToast({ title: '门店创建成功', icon: 'success' });
      }
      
      this.setData({ showModal: false });
      wx.hideLoading();
    }, 500);

    // 实际云函数调用代码（预留）
    /*
    const cloudFunctionName = this.data.isEdit ? 'updateStore' : 'createStore';
    wx.cloud.callFunction({
      name: cloudFunctionName,
      data: {
        storeId: this.data.currentStoreId,
        ...this.data.formData
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        this.loadStores();
        this.setData({ showModal: false });
        wx.showToast({ 
          title: this.data.isEdit ? '门店信息已更新' : '门店创建成功', 
          icon: 'success' 
        });
      }
      wx.hideLoading();
    })
    .catch(err => {
      console.error(`${this.data.isEdit ? '更新' : '创建'}门店失败:`, err);
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
    */
  }
});
