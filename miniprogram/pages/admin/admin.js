const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    currentTab: 0, 
    subTab: 0,  // 0=战绩公示, 1=人员管理
    // 🔥 新增统计数据
    stats: {
      leads: 158,
      showings: 45,
      totalUsers: 45
    },
    // 🔥 新增战绩公示数据
    reportType: 'anchor',
    anchorReports: [
      { id: 1, name: '王金牌', videos: 5, leads: 12, lives: 2, status: 'pass', statusText: '✓ 已审' },
      { id: 2, name: '李销冠', videos: 3, leads: 8, lives: 1, status: 'pass', statusText: '✓ 已审' },
      { id: 3, name: '张主播', videos: 0, leads: 0, lives: 0, status: 'none', statusText: '未提报' }
    ],
    brokerReports: [
      { id: 1, name: '陈经理', leads: 6, showings: 15, callbacks: 8, status: 'pass', statusText: '✓ 已审' },
      { id: 2, name: '刘经纪', leads: 0, showings: 0, callbacks: 0, status: 'none', statusText: '未提报' }
    ],
    // 🔥 新增总计数据
    anchorTotal: {
      videos: 8,
      leads: 20,
      lives: 3
    },
    brokerTotal: {
      leads: 6,
      showings: 15,
      callbacks: 8
    },
    // 🔥 新增待审核数据（初始为0，从数据库加载）
    auditDetailType: '',  // 'report' | 'article' | 'user' | ''
    pendingReports: 0,
    pendingArticles: 0,
    pendingUsers: 0,
    pendingUserList: [],
    // 🔥 新增成员列表
    memberList: [],
    auditList: [], // 战绩审核列表
    scriptList: [], // 文案审核列表
    userList: [], // 人员管理列表
    leadsList: [], // 线索管理列表
    showEditModal: false,
    showLeadsModal: false,
    editingArticle: {},
    editingArticleId: '',
    editingCategoryIndex: 0,
    selectedLead: {},
    articleCategories: ['口播', '探盘', '口盘', 'IP', '避坑', '获客']
  },

  onShow() {
    // 页面显示时加载所有数据
    this.fetchDashboard();
  },

  // 获取仪表盘数据
  fetchDashboard() {
    // 显示加载状态
    wx.showLoading({ title: '加载中...' });
    
    console.log('开始获取仪表盘数据...');
    
    // 实现分批查询，减少单次查询负担
    const fetchDataBatch = async () => {
      try {
        // 1. 首先获取待审核数据（数量较少，优先级高）
        const [applicationsRes, pendingReportsRes, pendingArticlesRes] = await Promise.all([
          db.collection('applications').where({
            status: 'pending'
          }).get(),
          
          db.collection('reports').where({
            status: 'pending'
          }).get(),
          
          db.collection('articles').where({
            status: 'pending'
          }).get()
        ]);
        
        // 2. 然后获取用户数据（使用分页，避免一次性获取过多）
        const usersRes = await db.collection('users')
          .limit(50)
          .orderBy('createdAt', 'desc')
          .get();
        
        // 3. 获取所有文案（用于审核）
        const articlesRes = await db.collection('articles')
          .limit(50)
          .orderBy('createdAt', 'desc')
          .get();
        
        console.log('数据获取成功：');
        console.log('待审核入伍申请:', applicationsRes.data.length);
        console.log('待审核战绩:', pendingReportsRes.data.length);
        console.log('待审核文案:', pendingArticlesRes.data.length);
        console.log('用户数据:', usersRes.data.length);
        console.log('文案数据:', articlesRes.data.length);
        
        // 处理数据
        let auditList = pendingReportsRes.data;
        if (auditList.length === 0) {
          auditList = [
            {
              _id: 'mock_report_1',
              reporterId: 'anchor_test_openid_002',
              type: 'leads',
              count: 15,
              status: 'pending',
              createdAt: new Date()
            },
            {
              _id: 'mock_report_2',
              reporterId: 'anchor_test_openid_002',
              type: 'showings',
              count: 3,
              status: 'pending',
              createdAt: new Date()
            }
          ];
        }
        
        let pendingUserList = applicationsRes.data;
        
        // 处理用户数据，添加roleText字段
        let memberList = usersRes.data.map(user => ({
          id: user._id,
          _openid: user._openid,
          name: user.profile?.nickname || user.name || '未设置姓名',
          role: user.role || 'visitor',
          roleText: this.getRoleText(user.role),
          phone: user.profile?.phone ? this.maskPhone(user.profile.phone) : '未设置',
          businessType: user.business_type,
          businessTypeText: this.getBusinessTypeText(user.business_type),
          storeId: user.storeId,
          storeName: user.storeName,
          joinTime: user.createdAt ? this.formatTime(user.createdAt) : '未知',
          application: null
        }));
        
        // 如果没有用户数据，添加模拟数据
        if (memberList.length === 0) {
          memberList = [
            {
              id: 'mock_user_1',
              _openid: 'mock_openid_1',
              name: '王金牌',
              role: 'anchor',
              roleText: '实战主播',
              phone: '138****1234',
              joinTime: '2026-01-01',
              application: null
            },
            {
              id: 'mock_user_2',
              _openid: 'mock_openid_2',
              name: '李销冠',
              role: 'broker',
              roleText: '经纪人',
              phone: '139****5678',
              joinTime: '2026-01-02',
              businessType: 'rental',
              businessTypeText: '租赁',
              application: null
            },
            {
              id: 'mock_user_3',
              _openid: 'mock_openid_3',
              name: '张小明',
              role: 'student',
              roleText: '学员',
              phone: '137****9876',
              joinTime: '2026-01-03',
              storeId: '1',
              storeName: '河西一店',
              application: {
                identity: '经纪人(有经验)',
                painPoints: ['缺客流', '没素材'],
                status: 'approved',
                storeId: '1',
                storeName: '河西一店',
                createdAt: new Date('2026-01-03')
              }
            },
            {
              id: 'mock_user_4',
              _openid: 'mock_openid_4',
              name: '赵小红',
              role: 'student',
              roleText: '学员',
              phone: '136****5432',
              joinTime: '2026-01-04',
              storeId: '2',
              storeName: '和平二店',
              application: {
                identity: '经纪人(无经验)',
                painPoints: ['不会播'],
                status: 'pending',
                createdAt: new Date('2026-01-04')
              }
            }
          ];
        } else {
          // 如果有真实数据，补充学员模拟数据
          const hasStudent = memberList.some(m => m.role === 'student');
          if (!hasStudent) {
            memberList.push(
              {
                id: 'mock_user_3',
                _openid: 'mock_openid_3',
                name: '张小明',
                role: 'student',
                roleText: '学员',
                phone: '137****9876',
                joinTime: '2026-01-03',
                application: {
                  identity: '经纪人(有经验)',
                  painPoints: ['缺客流', '没素材'],
                  status: 'approved',
                  createdAt: new Date('2026-01-03')
                }
              },
              {
                id: 'mock_user_4',
                _openid: 'mock_openid_4',
                name: '赵小红',
                role: 'student',
                roleText: '学员',
                phone: '136****5432',
                joinTime: '2026-01-04',
                application: {
                  identity: '经纪人(无经验)',
                  painPoints: ['不会播'],
                  status: 'pending',
                  createdAt: new Date('2026-01-04')
                }
              }
            );
          }
        }
        
        // 关联真实学员的application数据
        if (applicationsRes.data.length > 0) {
          memberList = memberList.map(member => {
            if (member.role === 'student' && !member.application) {
              const app = applicationsRes.data.find(a => a._openid === member._openid);
              if (app) {
                member.application = app;
              }
            }
            return member;
          });
        }
        
        // 更新详细列表数据
        this.setData({
          auditList: auditList,
          scriptList: articlesRes.data,
          pendingUserList: pendingUserList,
          memberList: memberList,
          userList: usersRes.data,
          // 确保计数正确
          pendingReports: auditList.length,
          pendingArticles: pendingArticlesRes.data.length,
          pendingUsers: pendingUserList.length
        });
        
        console.log('仪表盘数据更新完成');
        
      } catch (err) {
        console.error('加载数据失败：', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        // 隐藏加载状态
        wx.hideLoading();
      }
    };
    
    // 执行分批查询
    fetchDataBatch();
  },
  
  // 格式化时间
  formatTime(time) {
    if (!time) return '未知';
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.idx });
  },

  // 战绩审核 - 通过
  auditPass(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '审核通过',
      content: '确定通过这条战绩审核？',
      confirmText: '通过',
      confirmColor: '#D4B083',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          try {
            await db.collection('reports').doc(id).update({
              data: {
                status: 'approved',
                updatedAt: db.serverDate()
              }
            });
            
            wx.hideLoading();
            wx.showToast({ title: '已通过', icon: 'success' });
            
            const list = this.data.auditList.filter(a => a._id !== id);
            this.setData({ 
              auditList: list,
              pendingReports: list.length
            });
          } catch (err) {
            wx.hideLoading();
            console.error('审核通过失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 战绩审核 - 驳回
  auditReject(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '审核驳回',
      content: '确定驳回这条战绩？驳回后需要重新提报。',
      confirmText: '驳回',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          try {
            await db.collection('reports').doc(id).update({
              data: {
                status: 'rejected',
                updatedAt: db.serverDate()
              }
            });
            
            wx.hideLoading();
            wx.showToast({ title: '已驳回', icon: 'none' });
            
            const list = this.data.auditList.filter(a => a._id !== id);
            this.setData({ 
              auditList: list,
              pendingReports: list.length
            });
          } catch (err) {
            wx.hideLoading();
            console.error('审核驳回失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 文案审核 - 通过
  scriptPass(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '审核通过',
      content: '确定通过这条文案审核？通过后将发布到文案库。',
      confirmText: '通过',
      confirmColor: '#D4B083',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          try {
            await db.collection('articles').doc(id).update({
              data: {
                status: 'published',
                updatedAt: db.serverDate()
              }
            });
            
            wx.hideLoading();
            wx.showToast({ title: '已通过并发布', icon: 'success' });
            
            const list = this.data.scriptList.filter(s => s._id !== id);
            this.setData({ 
              scriptList: list,
              pendingArticles: list.length
            });
          } catch (err) {
            wx.hideLoading();
            console.error('审核通过失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 文案审核 - 驳回
  scriptReject(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '审核驳回',
      content: '确定驳回这条文案？驳回后文案将返回草稿状态。',
      confirmText: '驳回',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          try {
            await db.collection('articles').doc(id).update({
              data: {
                status: 'draft',
                updatedAt: db.serverDate()
              }
            });
            
            wx.hideLoading();
            wx.showToast({ title: '已驳回', icon: 'none' });
            
            const list = this.data.scriptList.filter(s => s._id !== id);
            this.setData({ 
              scriptList: list,
              pendingArticles: list.length
            });
          } catch (err) {
            wx.hideLoading();
            console.error('审核驳回失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  scriptEdit(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const article = this.data.scriptList[index];
    
    const categoryIndex = this.data.articleCategories.indexOf(article.category) || 0;
    
    this.setData({
      showEditModal: true,
      editingArticle: article,
      editingArticleId: id,
      editingCategoryIndex: categoryIndex
    });
  },

  closeEditModal() {
    this.setData({
      showEditModal: false,
      editingArticle: {},
      editingArticleId: '',
      editingCategoryIndex: 0
    });
  },

  onEditTitleChange(e) {
    this.setData({
      'editingArticle.title': e.detail.value
    });
  },

  onEditCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      editingCategoryIndex: index,
      'editingArticle.category': this.data.articleCategories[index]
    });
  },

  onEditContentChange(e) {
    this.setData({
      'editingArticle.content.script': e.detail.value
    });
  },

  // 线索管理相关方法
  loadLeads() {
    wx.showLoading({ title: '加载线索...' });
    
    // 模拟加载线索数据
    setTimeout(() => {
      wx.hideLoading();
      
      const leads = [
        {
          id: 1,
          name: '张先生',
          phone: '138****1234',
          source: '微信获客',
          status: '未分配',
          createdAt: '2026-02-10 14:30',
          requirement: '预算200万，想在河西买学区房'
        },
        {
          id: 2,
          name: '李女士',
          phone: '139****5678',
          source: '在线咨询',
          status: '已分配',
          assignTo: '王金牌',
          createdAt: '2026-02-10 10:20',
          requirement: '想租和平区两室一厅'
        }
      ];
      
      this.setData({ leadsList: leads });
    }, 1000);
  },

  showLeadsDetail(e) {
    const lead = this.data.leadsList[e.currentTarget.dataset.index];
    this.setData({ selectedLead: lead, showLeadsModal: true });
  },

  closeLeadsModal() {
    this.setData({ showLeadsModal: false, selectedLead: {} });
  },

  assignLead() {
    wx.showActionSheet({
      itemList: ['王金牌', '李销冠', '陈经理'],
      success: (res) => {
        const assignee = ['王金牌', '李销冠', '陈经理'][res.tapIndex];
        
        // 更新线索状态
        const updatedLeads = this.data.leadsList.map(lead => {
          if (lead.id === this.data.selectedLead.id) {
            return { ...lead, status: '已分配', assignTo: assignee };
          }
          return lead;
        });
        
        this.setData({ leadsList: updatedLeads });
        this.closeLeadsModal();
        
        wx.showToast({
          title: `线索已分配给${assignee}`,
          icon: 'success'
        });
      }
    });
  },

  saveAndPassArticle() {
    const id = this.data.editingArticleId;
    const article = this.data.editingArticle;
    
    if (!article.title || !article.content?.script) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
        
        db.collection('articles')
          .doc(id)
          .update({
            data: {
              title: article.title,
              category: article.category,
              'content.script': article.content.script,
              status: 'approved',
              updatedAt: db.serverDate()
            }
          })
          .then(res => {
            wx.hideLoading();
            
            const list = this.data.scriptList.filter(s => s._id !== id);
            this.setData({ 
              scriptList: list,
              pendingArticles: list.length,
              showEditModal: false
            });
            
            wx.showToast({ title: '已上架', icon: 'success' });
          })
      .catch(err => {
        wx.hideLoading();
        console.error('保存失败:', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 人员管理 - 移出
  kickUser(e) {
    const id = e.currentTarget.dataset.id;
    
    // 删除用户（或标记为禁用）
    db.collection('users')
      .doc(id)
      .remove()
      .then(res => {
        // 刷新列表
        this.fetchUserList();
        wx.showToast({ title: '已移出', icon: 'none' });
      })
      .catch(err => {
        console.error('移出用户失败：', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 人员管理 - 修改角色
  changeRole(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showActionSheet({
      itemList: ['设为访客', '设为学员', '设为主播', '设为经纪人', '设为管理员'],
      success: (res) => {
        const roles = ['visitor', 'student', 'anchor', 'broker', 'admin'];
        const newRole = roles[res.tapIndex];
        
        // 如果选择经纪人，继续选择业务类型
        if (newRole === 'broker') {
          wx.showActionSheet({
            itemList: ['租赁经纪人', '二手房经纪人', '新房经纪人'],
            success: (res2) => {
              const businessTypes = ['rental', 'trading', 'new_house'];
              this.updateUserRole(id, newRole, businessTypes[res2.tapIndex]);
            }
          });
        } else {
          this.updateUserRole(id, newRole, null);
        }
      }
    });
  },

  // 更新用户角色
  updateUserRole(id, role, businessType) {
    const updateData = { role };
    if (businessType) {
      updateData.business_type = businessType;
    }
    
    db.collection('users').doc(id).update({ data: updateData })
      .then(() => {
        this.fetchDashboard();
        wx.showToast({ title: '身份已变更' });
      })
      .catch(err => {
        console.error('修改角色失败：', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 加载人员管理列表
  fetchUserList() {
    console.log('[fetchUserList] 开始加载人员管理列表');
    db.collection('users')
      .limit(100)
      .get()
      .then(res => {
        console.log('[fetchUserList] 数据库返回用户数:', res.data.length);
        // 处理用户数据，添加roleText字段
        const userList = res.data.map(user => ({
          ...user,
          roleText: this.getRoleText(user.role)
        }));
        console.log('获取人员管理列表：', userList.length, '人');
        this.setData({ userList });
      })
      .catch(err => {
        console.error('加载人员管理列表失败：', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  // 获取角色文本
  getRoleText(role) {
    const roleMap = {
      admin: '管理员',
      anchor: '实战主播',
      broker: '经纪人',
      student: '学员',
      visitor: '访客',
      customer: 'C端客户',
      tenant: '租客'
    };
    return roleMap[role] || '未知角色';
  },

  // 获取业务类型文本
  getBusinessTypeText(businessType) {
    const typeMap = {
      rental: '租赁',
      trading: '二手房',
      new_house: '新房'
    };
    return typeMap[businessType] || '';
  },

  // 手机号脱敏
  maskPhone(phone) {
    if (!phone || phone.length < 11) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(7);
  },

  // 6宫格点击 - 切换到对应Tab
  goToAudit(e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'user') {
      this.setData({ currentTab: 0 });
    } else if (type === 'article') {
      this.setData({ currentTab: 1 });
    }
  },

  // 占位提示
  showToast() {
    wx.showToast({ title: '功能部署中', icon: 'none' });
  },

  // 切换主播/经纪人类型
  switchReportType(e) {
    this.setData({ reportType: e.currentTarget.dataset.type });
  },

  // 切换副Tab
  switchSubTab(e) {
    this.setData({ subTab: e.currentTarget.dataset.idx });
  },

  // 展开审核详情
  toggleAuditDetail(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 
      auditDetailType: type,
      currentTab: -1  // 隐藏旧的Tab内容
    });
  },

  // 关闭审核详情
  closeAuditDetail() {
    this.setData({ auditDetailType: '' });
  },

  // 拨打电话
  callMember(e) {
    e.stopPropagation();
    const phone = e.currentTarget.dataset.phone;
    wx.showModal({
      title: '拨打电话',
      content: phone,
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: phone.replace(/\*/g, '') });
        }
      }
    });
  },

  // 显示成员详情
  showMemberDetail(e) {
    const id = e.currentTarget.dataset.id;
    const user = this.data.memberList.find(u => u.id === id);
    
    if (!user) {
      wx.showToast({ title: '用户信息不存在', icon: 'none' });
      return;
    }
    
    // 如果是模拟数据，将完整数据保存到全局变量
    if (id.startsWith('mock_user_')) {
      app.globalData.mockUserData = user;
      wx.navigateTo({
        url: `/pages/admin/user-detail/user-detail?id=${id}&isMock=true`
      });
    } else {
      wx.navigateTo({
        url: `/pages/admin/user-detail/user-detail?id=${id}`
      });
    }
  },

  // 入伍审核 - 通过
  userPass(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '审核通过',
      content: '确定通过这个入伍申请？通过后将创建用户账号。',
      confirmText: '通过',
      confirmColor: '#D4B083',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          try {
            const application = this.data.pendingUserList.find(u => u._id === id);
            
            if (!application) {
              wx.hideLoading();
              wx.showToast({ title: '申请不存在', icon: 'none' });
              return;
            }
            
            // 更新申请状态
            await db.collection('applications').doc(id).update({
              data: {
                status: 'approved',
                updatedAt: db.serverDate()
              }
            });
            
            // 检查是否已存在该用户（通过手机号判断，避免同一微信账号多次申请）
            console.log('[审核通过] 检查用户是否存在，手机号:', application.phone);
            console.log('[审核通过] 申请信息:', application);
            
            try {
              // 先查询所有用户，看是否有相同手机号
              const allUsers = await db.collection('users').where({
                phone: application.phone
              }).get();
              
              console.log('[审核通过] 查询结果:', allUsers.data.length, '个用户');
              if (allUsers.data.length > 0) {
                console.log('[审核通过] 已存在用户信息:', allUsers.data);
              }
              
              if (allUsers.data.length === 0) {
                // 创建用户账号，使用申请中的门店信息和_openid
                console.log('[审核通过] 创建新用户');
                await db.collection('users').add({
                  data: {
                    name: application.name,
                    phone: application.phone,
                    identity: application.identity,
                    painPoints: application.painPoints,
                    role: 'student',
                    storeId: application.storeId,
                    storeName: application.storeName,
                    createdAt: db.serverDate()
                    // _openid由微信云开发自动添加
                  }
                });
                console.log('[审核通过] 创建新用户成功');
              } else {
                console.log('[审核通过] 用户已存在，跳过创建');
              }
            } catch (err) {
              console.error('[审核通过] 查询或创建用户失败:', err);
            }
            
            wx.hideLoading();
            wx.showToast({ title: '已通过并创建账号', icon: 'success' });
            
            const list = this.data.pendingUserList.filter(u => u._id !== id);
            this.setData({ 
              pendingUserList: list,
              pendingUsers: list.length
            });
            
            // 刷新人员列表
            this.fetchDashboard();
            this.fetchUserList();
          } catch (err) {
            wx.hideLoading();
            console.error('审核通过失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 入伍审核 - 拒绝
  userReject(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '审核拒绝',
      content: '确定拒绝这个入伍申请？拒绝后将无法再次申请。',
      confirmText: '拒绝',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          try {
            await db.collection('applications').doc(id).update({
              data: {
                status: 'rejected',
                updatedAt: db.serverDate()
              }
            });
            
            wx.hideLoading();
            wx.showToast({ title: '已拒绝', icon: 'none' });
            
            const list = this.data.pendingUserList.filter(u => u._id !== id);
            this.setData({ 
              pendingUserList: list,
              pendingUsers: list.length
            });
          } catch (err) {
            wx.hideLoading();
            console.error('审核拒绝失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 管理工具
  manageArt() {
    wx.navigateTo({
      url: '/pages/admin/art-manage/art-manage'
    });
  },

  manageCourse() {
    wx.navigateTo({
      url: '/pages/admin/course-manage/course-manage'
    });
  },

  manageAssign() {
    wx.showToast({ title: '线索指派开发中', icon: 'none' });
  },

  manageStore() {
    wx.navigateTo({
      url: '/pages/admin/store-manage/store-manage'
    });
  },

  manageSettings() {
    wx.navigateTo({
      url: '/pages/admin/settings/settings'
    });
  },

  // 管理工具（保留兼容）
  manageTools() {
    wx.navigateTo({
      url: '/pages/admin/settings/settings'
    });
  },

  // 管理工具
  manageTools() {
    wx.navigateTo({
      url: '/pages/admin/tools/tools'
    });
  },

  // 更改成员身份
  changeMemberRole(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    
    wx.showActionSheet({
      itemList: ['设为实战主播', '设为内部经纪人', '设为学员'],
      success: (res) => {
        const roles = ['anchor', 'broker', 'student'];
        const roleTexts = ['实战主播', '内部经纪人', '学员'];
        
        wx.showToast({ 
          title: `${name} 已改为${roleTexts[res.tapIndex]}`, 
          icon: 'success' 
        });
        
        // Mock: 更新本地数据
        const list = this.data.memberList.map(m => {
          if (m.id === id) {
            return { ...m, role: roles[res.tapIndex], roleText: roleTexts[res.tapIndex] };
          }
          return m;
        });
        this.setData({ memberList: list });
      }
    });
  },

  // 初始化日签数据
  onInitDailyData() {
    wx.showModal({
      title: '确认操作',
      content: '将生成30条文案+9张图片占位记录，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_daily_materials'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功生成${result.result.data.count}条`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  },

  // 初始化课程数据
  onInitCourseData() {
    wx.showModal({
      title: '确认操作',
      content: '将初始化24门课程数据，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_courses'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功初始化${result.result.data.count}门课程`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  },

  // 初始化文案数据
  onInitArticleData() {
    wx.showModal({
      title: '确认操作',
      content: '将初始化22条高质量文案数据，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_articles'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功初始化${result.result.data.count}条文案`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  }
})
