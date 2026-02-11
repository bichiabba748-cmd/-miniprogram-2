// 税费计算器 - 严格按PRD V1.1 (2024.12新政)
// 天津政策：140㎡分界线，契税/增值税/个税

const app = getApp();

// 税率常量表（PRD定义）
const TAX_RULES = {
  deedTax: {
    areaLimit: 140,              // 契税面积分界线（㎡）
    firstHomeSmall: 0.01,        // 首套 ≤140㎡
    firstHomeLarge: 0.015,       // 首套 >140㎡
    secondHomeSmall: 0.01,       // 二套 ≤140㎡ (新政红利)
    secondHomeLarge: 0.02,       // 二套 >140㎡
    thirdHome: 0.03              // 三套+
  },
  vat: {
    rate: 0.05,                  // 增值税征收率
    yearsLimit: 2                // 满X年免征
  },
  personalTax: {
    levyRate: 0.01,              // 核定征收比例
    capitalGainRate: 0.2         // 差额征收比例
  },
  landTransferFee: {
    rate: 0.01                   // 土地出让金：划拨土地1%，出让土地免征（但附记"私房补交"需交1%）
  }
};

// 缓存键名
const STORAGE_KEY = 'tax_calculator_input';

Page({
  data: {
    // 输入项
    totalPrice: '',              // 房屋总价（万）
    area: '',                    // 房屋面积（㎡）
    originalPrice: '',           // 原购价格（万，可选）
    
    // 关键属性
    homeCount: 1,                // 1:首套, 2:二套, 3:三套+
    years: 2,                    // 0:<2年, 2:满两年, 5:满五年
    isOnlyHome: true,            // 是否唯一住房
    useLevyMethod: true,         // 个税计算方式：true=核定征收, false=差额征收
    landType: '出让',            // 土地性质：'划拨'需交1%，'出让'免征，'出让补交'需交1%
    
    // 计算结果
    result: null,
    
    // 状态
    loading: false,
    error: '',
    
    // 选项配置
    homeCountOptions: [
      { value: 1, label: '首套房' },
      { value: 2, label: '二套房' },
      { value: 3, label: '三套+' }
    ],
    yearsOptions: [
      { value: 0, label: '< 两年' },
      { value: 2, label: '满两年' },
      { value: 5, label: '满五年' }
    ],
    onlyHomeOptions: [
      { value: true, label: '是唯一' },
      { value: false, label: '不唯一' }
    ],
    landTypeOptions: [
      { value: '出让', label: '出让土地\n免征' },
      { value: '划拨', label: '划拨土地\n1%' },
      { value: '出让补交', label: '出让\n附记需补交1%' }
    ]
  },

  onLoad() {
    this.loadCachedInput();
  },

  onShow() {
    // 每次显示时检查缓存
    this.loadCachedInput();
  },

  // 加载缓存的输入
  loadCachedInput() {
    try {
      const cached = wx.getStorageSync(STORAGE_KEY);
      if (cached) {
        this.setData({
          totalPrice: cached.totalPrice || '',
          area: cached.area || '',
          originalPrice: cached.originalPrice || '',
          homeCount: cached.homeCount || 1,
          years: cached.years || 2,
          isOnlyHome: cached.isOnlyHome !== undefined ? cached.isOnlyHome : true,
          useLevyMethod: cached.useLevyMethod !== undefined ? cached.useLevyMethod : true,
          landType: cached.landType || '出让'
        });
      }
    } catch (e) {
      console.error('加载缓存失败:', e);
    }
  },

  // 保存输入到缓存
  saveInputToCache() {
    try {
      const data = {
        totalPrice: this.data.totalPrice,
        area: this.data.area,
        originalPrice: this.data.originalPrice,
        homeCount: this.data.homeCount,
        years: this.data.years,
        isOnlyHome: this.data.isOnlyHome,
        useLevyMethod: this.data.useLevyMethod,
        landType: this.data.landType
      };
      wx.setStorageSync(STORAGE_KEY, data);
    } catch (e) {
      console.error('保存缓存失败:', e);
    }
  },

  // 输入处理
  onTotalPriceInput(e) {
    this.setData({ totalPrice: e.detail.value });
    this.saveInputToCache();
  },

  onAreaInput(e) {
    this.setData({ area: e.detail.value });
    this.saveInputToCache();
  },

  onOriginalPriceInput(e) {
    this.setData({ originalPrice: e.detail.value });
    this.saveInputToCache();
  },

  // 选项切换
  onHomeCountChange(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    this.setData({ homeCount: value });
    this.saveInputToCache();
  },

  onYearsChange(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    this.setData({ years: value });
    this.saveInputToCache();
  },

  onOnlyHomeChange(e) {
    const value = e.currentTarget.dataset.value === 'true';
    this.setData({ isOnlyHome: value });
    this.saveInputToCache();
  },

  // 土地性质切换
  onLandTypeChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ landType: value });
    this.saveInputToCache();
  },

  // 个税计算方式切换
  togglePersonalTaxMethod() {
    this.setData({ useLevyMethod: !this.data.useLevyMethod });
    this.saveInputToCache();
  },

  // 显示收费标准提示
  showTaxInfo(e) {
    const type = e.currentTarget.dataset.type;
    const infoMap = {
      deedTax: '契税收费标准：\n首套≤140㎡：1%\n首套>140㎡：1.5%\n二套≤140㎡：1%\n二套>140㎡：2%\n三套+：3%',
      vat: '增值税收费标准：\n满2年：免征\n不满2年：成交价×5%',
      personalTax: '个人所得税收费标准：\n满五唯一：免征\n核定征收：成交价×1%\n差额征收：(现售价-原购价)×20%',
      landTransferFee: '土地出让金收费标准：\n划拨土地：成交价×1%\n出让土地：免征\n附记"私房补交"：成交价×1%'
    };
    wx.showModal({
      title: '收费标准',
      content: infoMap[type] || '暂无说明',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 验证输入
  validateInput() {
    const { totalPrice, area } = this.data;
    
    if (!totalPrice || isNaN(totalPrice) || parseFloat(totalPrice) <= 0) {
      return '请输入有效的房屋总价';
    }
    if (!area || isNaN(area) || parseFloat(area) <= 0) {
      return '请输入有效的房屋面积';
    }
    return '';
  },

  // 计算税费
  calculateTax() {
    const error = this.validateInput();
    if (error) {
      this.setData({ error, result: null });
      wx.showToast({ title: error, icon: 'none' });
      return;
    }

    this.setData({ loading: true, error: '' });

    // 模拟计算延迟（提升用户体验）
    setTimeout(() => {
      const result = this.doCalculate();
      this.setData({ 
        result, 
        loading: false 
      });
    }, 300);
  },

  // 核心计算逻辑（严格按PRD）
  doCalculate() {
    const { 
      totalPrice, 
      area, 
      originalPrice,
      homeCount, 
      years, 
      isOnlyHome,
      useLevyMethod,
      landType 
    } = this.data;

    const price = parseFloat(totalPrice);
    const areaNum = parseFloat(area);
    const originPrice = originalPrice ? parseFloat(originalPrice) : 0;

    // ========== 契税计算 ==========
    let deedTax = 0;
    let deedTaxRate = 0;
    let deedTaxSaved = 0;  // 新政节省金额

    if (homeCount === 1) {  // 首套
      if (areaNum <= TAX_RULES.deedTax.areaLimit) {
        deedTaxRate = TAX_RULES.deedTax.firstHomeSmall;
      } else {
        deedTaxRate = TAX_RULES.deedTax.firstHomeLarge;
      }
      deedTax = price * deedTaxRate;
    } else if (homeCount === 2) {  // 二套
      if (areaNum <= TAX_RULES.deedTax.areaLimit) {
        deedTaxRate = TAX_RULES.deedTax.secondHomeSmall;
        // 新政红利：旧政策为3%，现在1%
        deedTaxSaved = price * 0.02;
      } else {
        deedTaxRate = TAX_RULES.deedTax.secondHomeLarge;
      }
      deedTax = price * deedTaxRate;
    } else {  // 三套+
      deedTaxRate = TAX_RULES.deedTax.thirdHome;
      deedTax = price * deedTaxRate;
    }

    // ========== 增值税计算 ==========
    let vat = 0;
    let vatExempt = false;
    
    if (years >= TAX_RULES.vat.yearsLimit) {
      vat = 0;
      vatExempt = true;  // 满2年免征（新政红利）
    } else {
      vat = price * TAX_RULES.vat.rate;
    }

    // ========== 个税计算 ==========
    let personalTax = 0;
    let personalTaxMethod = '';
    let personalTaxExempt = false;

    if (years >= 5 && isOnlyHome) {
      personalTax = 0;
      personalTaxExempt = true;  // 满五唯一免征
    } else {
      if (useLevyMethod) {
        personalTax = price * TAX_RULES.personalTax.levyRate;
        personalTaxMethod = '核定征收';
      } else {
        // 差额征收需要原购价格
        if (originPrice > 0) {
          const gain = price - originPrice;
          personalTax = gain > 0 ? gain * TAX_RULES.personalTax.capitalGainRate : 0;
        } else {
          // 没有原购价格，默认用核定征收
          personalTax = price * TAX_RULES.personalTax.levyRate;
        }
        personalTaxMethod = '差额征收';
      }
    }

    // ========== 土地出让金计算 ==========
    let landTransferFee = 0;
    let landTransferFeeExempt = false;
    
    if (landType === '出让') {
      landTransferFee = 0;
      landTransferFeeExempt = true;  // 出让土地免征
    } else {
      // 划拨土地 或 出让需补交，都按1%计算
      landTransferFee = price * TAX_RULES.landTransferFee.rate;
    }

    // ========== 合计 ==========
    const totalTax = deedTax + vat + personalTax + landTransferFee;

    return {
      deedTax: deedTax.toFixed(2),
      deedTaxRate: (deedTaxRate * 100).toFixed(0),
      deedTaxSaved: deedTaxSaved.toFixed(2),
      hasDeedTaxBonus: deedTaxSaved > 0,

      vat: vat.toFixed(2),
      vatExempt,

      personalTax: personalTax.toFixed(2),
      personalTaxMethod,
      personalTaxExempt,

      landTransferFee: landTransferFee.toFixed(2),
      landTransferFeeExempt,
      landType,

      totalTax: totalTax.toFixed(2)
    };
  },

  // 重置
  reset() {
    this.setData({
      totalPrice: '',
      area: '',
      originalPrice: '',
      homeCount: 1,
      years: 2,
      isOnlyHome: true,
      useLevyMethod: true,
      landType: '出让',
      result: null,
      error: ''
    });
    try {
      wx.removeStorageSync(STORAGE_KEY);
    } catch (e) {
      console.error('清除缓存失败:', e);
    }
    wx.showToast({ title: '已重置', icon: 'success' });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});