Page({
  data: {
    categories: [
      { key: 'daily_hot', name: '每日热点' },
      { key: 'school_zone', name: '学区房专题' },
      { key: 'listing_intro', name: '房源讲解' },
      { key: 'deal_story', name: '成交故事' },
      { key: 'avoid_pit', name: '避坑科普' }
    ],
    currentCategory: 'daily_hot',
    scriptList: [],
    showDetail: false,
    currentScript: null,
    isLoading: true,
    isOffline: false
  },

  onLoad() {
    this.loadLastCategory();
    this.loadScriptsFromCloud();
    console.log('[直播脚本库] 页面加载完成');
  },

  loadLastCategory() {
    const lastCategory = wx.getStorageSync('script_last_category');
    if (lastCategory) {
      this.setData({ currentCategory: lastCategory });
    }
  },

  saveLastCategory(category) {
    wx.setStorageSync('script_last_category', category);
  },

  loadScriptsFromCloud() {
    this.setData({ isLoading: true, isOffline: false });
    
    wx.cloud.callFunction({
      name: 'getScriptTemplates',
      data: {
        category: this.data.currentCategory,
        status: 'published',
        pageSize: 50
      },
      success: (res) => {
        console.log('[直播脚本库] 云端获取成功:', res);
        
        if (res.result.code === 0 && res.result.data.list.length > 0) {
          this.setData({ 
            scriptList: res.result.data.list,
            isLoading: false,
            isOffline: false
          });
        } else {
          console.log('[直播脚本库] 云端无数据，使用本地兜底');
          this.loadFallbackScripts();
        }
      },
      fail: (err) => {
        console.error('[直播脚本库] 云端获取失败:', err);
        if (err.errMsg.includes('FunctionName parameter could not be found')) {
          console.log('[直播脚本库] 云函数未部署，使用本地兜底');
        }
        this.loadFallbackScripts();
      }
    });
  },

  loadFallbackScripts() {
    const allScripts = this.getFallbackTemplates();
    const filteredScripts = allScripts.filter(script => 
      script.category === this.data.currentCategory
    );
    this.setData({ 
      scriptList: filteredScripts,
      isLoading: false,
      isOffline: true
    });
    
    wx.showToast({
      title: '当前使用本地模板',
      icon: 'none',
      duration: 2000
    });
  },

  getFallbackTemplates() {
    return [
      {
        id: 'fallback_001',
        category: 'daily_hot',
        title: '今天天津楼市三个变化，别错过',
        scene: '每日热点开场，吸引关注',
        tags: ['热点', '资讯', '必看'],
        durationMin: 3,
        content: {
          opening: '家人们晚上好，今天我用3分钟把天津最近楼市最关键的3个变化讲透...',
          painPoints: [
            '信息太多分不清真假',
            '看房容易踩坑',
            '价格谈不下来'
          ],
          valuePoints: [
            '一句话判断是否该出手',
            '三类房源最抗跌',
            '砍价话术给你现成的'
          ],
          interaction: [
            '你在哪个区？我按区给你一句建议',
            '想要清单的打"1"',
            '首套还是二套？我给你算一笔账'
          ],
          cta: '私信我"区域+预算"，我发你一份本周可看的真实房源清单',
          notes: '适合开场吸引流量，节奏要快'
        },
        version: '1.0'
      },
      {
        id: 'fallback_002',
        category: 'school_zone',
        title: '学区房别只看名校，这三个点最要命',
        scene: '学区房专题，家长必看',
        tags: ['学区', '教育', '刚需'],
        durationMin: 5,
        content: {
          opening: '很多家长买学区房第一步就走错：只盯名校，不看落户和片区稳定...',
          painPoints: [
            '买了也上不了',
            '片区划片变动',
            '房龄老、交易难'
          ],
          valuePoints: [
            '一分钟判断能不能稳上',
            '三种学区房最保值',
            '预算不足的替代方案'
          ],
          interaction: [
            '孩子几年级？我按年级给策略',
            '你预算多少？我告诉你适合的学区类型'
          ],
          cta: '打"学区"我给你发一张片区判断表',
          notes: '针对有学龄儿童的家庭'
        },
        version: '1.0'
      },
      {
        id: 'fallback_003',
        category: 'listing_intro',
        title: '这套房值不值？我用5句话讲透',
        scene: '房源讲解通用模板',
        tags: ['房源', '讲解', '对比'],
        durationMin: 5,
        content: {
          opening: '家人们看房别被装修带跑，我用5句话把这套房的优缺点讲透...',
          painPoints: [
            '户型看不懂',
            '楼层采光没概念',
            '小区品质靠猜'
          ],
          valuePoints: [
            '一眼看出户型雷点',
            '采光风向怎么判断',
            '同小区怎么比价'
          ],
          interaction: [
            '你更在意采光还是楼层？',
            '要不要我把同小区对比也拉给你？'
          ],
          cta: '想看同预算更优的，私信我"预算+区域"，我给你直接发对比表',
          notes: '适合看房时讲解，突出专业度'
        },
        version: '1.0'
      }
    ];
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    this.saveLastCategory(category);
    this.loadScriptsFromCloud();
    console.log('[直播脚本库] 切换分类:', category);
  },

  onScriptTap(e) {
    const scriptId = e.currentTarget.dataset.id;
    const script = this.data.scriptList.find(s => s.id === scriptId || s._id === scriptId);
    if (script) {
      this.setData({ 
        showDetail: true,
        currentScript: script
      });
      console.log('[直播脚本库] 查看脚本:', script.title);
    }
  },

  onCloseDetail() {
    this.setData({ 
      showDetail: false,
      currentScript: null
    });
  },

  onCopyScript() {
    if (!this.data.currentScript) return;

    const script = this.data.currentScript;
    const content = script.content;

    const copyText = `【标题】${script.title}
【适用】${script.scene}

【开场】
${content.opening}

【痛点】
${content.painPoints.map(p => `- ${p}`).join('\n')}

【价值点】
${content.valuePoints.map(v => `- ${v}`).join('\n')}

【互动】
${content.interaction.map(i => `- ${i}`).join('\n')}

【收尾】
${content.cta}`;

    wx.setClipboardData({
      data: copyText,
      success: () => {
        wx.showToast({
          title: '脚本已复制',
          icon: 'success',
          duration: 2000
        });
        console.log('[直播脚本库] 复制成功:', script.title);
      },
      fail: (err) => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        });
        console.error('[直播脚本库] 复制失败:', err);
      }
    });
  },

  onRefresh() {
    this.loadScriptsFromCloud();
  }
});