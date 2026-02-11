// pages/tools/calculator/calculator.js
// 房贷计算器 - 纯前端计算

const app = getApp();

// 本地默认利率（兜底）- 天津市2024-2025最新利率
// 商贷：LPR 3.6% - 45BP = 3.15%
// 公积金：5年以上 2.85%
const DEFAULT_COMMERCIAL_RATE = 3.15;
const DEFAULT_FUND_RATE = 2.85;

// 生成年限选项（1-30年）
const YEAR_OPTIONS = Array.from({length: 30}, (_, i) => (i + 1) + '年');

// 商业贷款利率选项（天津常见利率）
const COMMERCIAL_RATE_OPTIONS = [
  { label: '首套', value: 3.15 },
  { label: '首套', value: 3.30 },
  { label: '首套', value: 3.40 },
  { label: '首套', value: 3.60 },
  { label: '二套', value: 3.80 },
  { label: '二套', value: 4.20 },
  { label: '固定', value: 4.00 },
  { label: '固定', value: 4.20 },
  { label: '固定', value: 4.50 }
];

// 公积金贷款利率选项
const FUND_RATE_OPTIONS = [
  { label: '首套(5年以上)', value: 2.85 },
  { label: '首套(5年内)', value: 2.35 },
  { label: '二套(5年以上)', value: 3.325 },
  { label: '二套(5年内)', value: 2.775 }
];

Page({
  data: {
    // 贷款类型：commercial(商业) / fund(公积金) / combined(组合)
    loanType: 'commercial',
    
    // 还款方式：equal_interest(等额本息) / equal_principal(等额本金)
    repaymentType: 'equal_interest',
    
    // 输入值
    commercialAmount: '',
    commercialRate: '',
    fundAmount: '',
    fundRate: '',
    years: 30,
    yearIndex: 29, // 默认30年
    
    // 默认利率（从云端读取或本地兜底）
    defaultCommercialRate: DEFAULT_COMMERCIAL_RATE,
    defaultFundRate: DEFAULT_FUND_RATE,
    
    // 年限选项
    yearOptions: YEAR_OPTIONS,
    
    // 利率选项
    commercialRateOptions: COMMERCIAL_RATE_OPTIONS,
    fundRateOptions: FUND_RATE_OPTIONS,
    commercialRateIndex: 0, // 默认首套 LPR-45BP
    fundRateIndex: 0, // 默认首套 5年以上
    
    // 计算结果
    showResult: false,
    loading: false,
    errorMsg: '',
    
    // 结果数据
    monthlyPayment: '0.00',
    totalInterest: '0.00',
    totalPayment: '0.00',
    loanAmount: '0.00',
    
    // 对比数据
    comparisonData: null,
    comparisonText: '',
    comparisonTip: '',
    
    // 弹窗
    showModal: false,
    showCommercialRateModal: false,
    showFundRateModal: false
  },

  onLoad(options) {
    console.log('[房贷计算器] 页面加载');
    
    // 初始化利率值
    this.setData({
      commercialRate: COMMERCIAL_RATE_OPTIONS[0].value,
      fundRate: FUND_RATE_OPTIONS[0].value
    });
    
    // 1. 尝试从云端读取利率
    this.loadRatesFromCloud();
    
    // 2. 从本地缓存恢复上次输入
    this.loadFromStorage();
  },

  onUnload() {
    // 页面卸载时保存输入值
    this.saveToStorage();
  },

  // 从云端读取利率配置
  async loadRatesFromCloud() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('system_config').doc('loan_rates').get();
      
      if (res.data) {
        const { commercial_lpr, housing_fund_rate } = res.data;
        this.setData({
          defaultCommercialRate: commercial_lpr || DEFAULT_COMMERCIAL_RATE,
          defaultFundRate: housing_fund_rate || DEFAULT_FUND_RATE
        });
        console.log('[房贷计算器] 云端利率读取成功:', res.data);
      }
    } catch (err) {
      console.log('[房贷计算器] 云端利率读取失败，使用本地默认值:', err);
      // 使用本地默认值（已在data中设置）
    }
  },

  // 从本地缓存读取
  loadFromStorage() {
    try {
      const saved = wx.getStorageSync('mortgage_calculator_data');
      if (saved) {
        // 查找利率对应的索引
        const commRateIndex = COMMERCIAL_RATE_OPTIONS.findIndex(
          item => item.value === saved.commercialRate
        ) || 0;
        const fundRateIndex = FUND_RATE_OPTIONS.findIndex(
          item => item.value === saved.fundRate
        ) || 0;
        
        this.setData({
          loanType: saved.loanType || 'commercial',
          repaymentType: saved.repaymentType || 'equal_interest',
          commercialAmount: saved.commercialAmount || '',
          commercialRate: saved.commercialRate || COMMERCIAL_RATE_OPTIONS[0].value,
          commercialRateIndex: commRateIndex,
          fundAmount: saved.fundAmount || '',
          fundRate: saved.fundRate || FUND_RATE_OPTIONS[0].value,
          fundRateIndex: fundRateIndex,
          years: saved.years || 30,
          yearIndex: (saved.years || 30) - 1
        });
        console.log('[房贷计算器] 已恢复上次输入:', saved);
      }
    } catch (err) {
      console.log('[房贷计算器] 读取本地缓存失败:', err);
    }
  },

  // 保存到本地缓存
  saveToStorage() {
    try {
      const data = {
        loanType: this.data.loanType,
        repaymentType: this.data.repaymentType,
        commercialAmount: this.data.commercialAmount,
        commercialRate: this.data.commercialRate,
        commercialRateIndex: this.data.commercialRateIndex,
        fundAmount: this.data.fundAmount,
        fundRate: this.data.fundRate,
        fundRateIndex: this.data.fundRateIndex,
        years: this.data.years
      };
      wx.setStorageSync('mortgage_calculator_data', data);
      console.log('[房贷计算器] 已保存输入值');
    } catch (err) {
      console.log('[房贷计算器] 保存本地缓存失败:', err);
    }
  },

  // 切换贷款类型
  switchLoanType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      loanType: type,
      showResult: false,
      errorMsg: ''
    });
  },

  // 切换还款方式
  switchRepaymentType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      repaymentType: type,
      showResult: false,
      errorMsg: ''
    });
  },

  // 输入处理
  onCommercialAmountInput(e) {
    this.setData({ commercialAmount: e.detail.value });
  },

  onFundAmountInput(e) {
    this.setData({ fundAmount: e.detail.value });
  },

  // 商贷利率选择
  onCommercialRateChange(e) {
    const index = e.detail.value;
    this.setData({
      commercialRateIndex: index,
      commercialRate: COMMERCIAL_RATE_OPTIONS[index].value
    });
  },

  // 公积金利率选择
  onFundRateChange(e) {
    const index = e.detail.value;
    this.setData({
      fundRateIndex: index,
      fundRate: FUND_RATE_OPTIONS[index].value
    });
  },

  // 年限选择
  onYearChange(e) {
    const index = e.detail.value;
    this.setData({
      yearIndex: index,
      years: parseInt(this.data.yearOptions[index])
    });
  },

  // 显示错误
  showError(msg) {
    this.setData({ errorMsg: msg });
    setTimeout(() => {
      this.setData({ errorMsg: '' });
    }, 3000);
  },

  // 验证输入
  validateInput() {
    const { loanType, commercialAmount, fundAmount, years } = this.data;
    
    let totalAmount = 0;
    
    if (loanType === 'commercial' || loanType === 'combined') {
      if (!commercialAmount || parseFloat(commercialAmount) <= 0) {
        this.showError('请输入商贷金额');
        return false;
      }
      totalAmount += parseFloat(commercialAmount);
    }
    
    if (loanType === 'fund' || loanType === 'combined') {
      if (!fundAmount || parseFloat(fundAmount) <= 0) {
        this.showError('请输入公积金金额');
        return false;
      }
      totalAmount += parseFloat(fundAmount);
    }
    
    if (totalAmount <= 0) {
      this.showError('贷款金额必须大于0');
      return false;
    }
    
    if (!years || years <= 0) {
      this.showError('请选择贷款年限');
      return false;
    }
    
    return true;
  },

  // 开始计算
  calculate() {
    if (!this.validateInput()) {
      return;
    }

    this.setData({ loading: true, showResult: false });

    // 模拟计算延迟（给用户反馈）
    setTimeout(() => {
      try {
        this.doCalculate();
      } catch (err) {
        console.error('[房贷计算器] 计算错误:', err);
        this.showError('计算出错，请检查输入');
      } finally {
        this.setData({ loading: false });
      }
    }, 300);
  },

  // 执行计算
  doCalculate() {
    const {
      loanType,
      repaymentType,
      commercialAmount,
      commercialRate,
      fundAmount,
      fundRate,
      years
    } = this.data;

    // 使用 picker 选中的利率
    const commRate = commercialRate || DEFAULT_COMMERCIAL_RATE;
    const fundRateVal = fundRate || DEFAULT_FUND_RATE;
    
    const months = years * 12;
    let totalMonthlyPayment = 0;
    let totalInterestAmount = 0;
    let totalLoanAmount = 0;

    // 计算商业贷款部分
    let commResult = null;
    if (loanType === 'commercial' || loanType === 'combined') {
      const amount = parseFloat(commercialAmount) * 10000; // 转为元
      totalLoanAmount += parseFloat(commercialAmount);
      
      commResult = this.calculateLoan(
        amount,
        commRate,
        months,
        repaymentType
      );
      
      totalMonthlyPayment += commResult.monthlyPayment;
      totalInterestAmount += commResult.totalInterest;
    }

    // 计算公积金贷款部分
    let fundResult = null;
    if (loanType === 'fund' || loanType === 'combined') {
      const amount = parseFloat(fundAmount) * 10000; // 转为元
      totalLoanAmount += parseFloat(fundAmount);
      
      fundResult = this.calculateLoan(
        amount,
        fundRateVal,
        months,
        repaymentType
      );
      
      totalMonthlyPayment += fundResult.monthlyPayment;
      totalInterestAmount += fundResult.totalInterest;
    }

    // 计算另一种还款方式用于对比
    const compareRepaymentType = repaymentType === 'equal_interest' ? 'equal_principal' : 'equal_interest';
    let compareTotalInterest = 0;

    if (loanType === 'commercial' || loanType === 'combined') {
      const amount = parseFloat(commercialAmount || 0) * 10000;
      const result = this.calculateLoan(amount, commRate, months, compareRepaymentType);
      compareTotalInterest += result.totalInterest;
    }
    if (loanType === 'fund' || loanType === 'combined') {
      const amount = parseFloat(fundAmount || 0) * 10000;
      const result = this.calculateLoan(amount, fundRateVal, months, compareRepaymentType);
      compareTotalInterest += result.totalInterest;
    }

    // 生成对比数据
    const comparisonData = this.generateComparisonData(
      loanType,
      commercialAmount,
      fundAmount,
      commRate,
      fundRateVal,
      months,
      totalLoanAmount * 10000
    );

    // 生成智能分析文案
    const interestDiff = Math.abs(totalInterestAmount - compareTotalInterest);
    const diffInWan = (interestDiff / 10000).toFixed(1);
    const currentType = repaymentType === 'equal_interest' ? '等额本息' : '等额本金';
    const compareType = repaymentType === 'equal_interest' ? '等额本金' : '等额本息';
    const moreOrLess = totalInterestAmount > compareTotalInterest ? '多付' : '少付';
    
    const comparisonText = `对比${compareType}，当前方案${moreOrLess}利息 ${diffInWan}万 元`;
    const comparisonTip = `${currentType}：每月还款${moreOrLess === '多付' ? '压力小' : '金额固定'}，${moreOrLess === '多付' ? '总利息较多' : '前期压力大但总利息较少'}。建议根据自身收入情况选择。`;

    this.setData({
      showResult: true,
      monthlyPayment: totalMonthlyPayment.toFixed(2),
      totalInterest: (totalInterestAmount / 10000).toFixed(2),
      totalPayment: ((totalInterestAmount + totalLoanAmount * 10000) / 10000).toFixed(2),
      loanAmount: totalLoanAmount.toFixed(2),
      comparisonData,
      comparisonText,
      comparisonTip
    });

    console.log('[房贷计算器] 计算完成:', {
      monthlyPayment: totalMonthlyPayment.toFixed(2),
      totalInterest: (totalInterestAmount / 10000).toFixed(2),
      comparisonText
    });
  },

  // 贷款计算核心逻辑
  calculateLoan(principal, annualRate, months, repaymentType) {
    const monthlyRate = annualRate / 100 / 12;
    
    if (repaymentType === 'equal_interest') {
      // 等额本息
      const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) 
        / (Math.pow(1 + monthlyRate, months) - 1);
      const totalPayment = monthlyPayment * months;
      const totalInterest = totalPayment - principal;
      
      return {
        monthlyPayment,
        totalInterest,
        totalPayment,
        firstMonth: monthlyPayment
      };
    } else {
      // 等额本金
      const monthlyPrincipal = principal / months;
      const firstMonthInterest = principal * monthlyRate;
      const firstMonthPayment = monthlyPrincipal + firstMonthInterest;
      
      // 总利息 = (总本金 + 每月本金) × 月利率 × 月数 / 2
      const totalInterest = (principal + monthlyPrincipal) * monthlyRate * months / 2;
      const totalPayment = principal + totalInterest;
      
      // 每月递减额 = 每月本金 × 月利率
      const decreaseAmount = monthlyPrincipal * monthlyRate;
      
      return {
        monthlyPayment: firstMonthPayment, // 首月还款
        totalInterest,
        totalPayment,
        firstMonth: firstMonthPayment,
        decreaseAmount
      };
    }
  },

  // 生成对比数据
  generateComparisonData(loanType, commAmount, fundAmount, commRate, fundRate, months, totalPrincipal) {
    let commInterest = 0;
    let commPrincipal = 0;
    let fundInterest = 0;
    let fundPrincipal = 0;

    if (loanType === 'commercial' || loanType === 'combined') {
      commPrincipal = parseFloat(commAmount || 0) * 10000;
      const result = this.calculateLoan(commPrincipal, commRate, months, 'equal_interest');
      commInterest = result.totalInterest;
    }
    if (loanType === 'fund' || loanType === 'combined') {
      fundPrincipal = parseFloat(fundAmount || 0) * 10000;
      const result = this.calculateLoan(fundPrincipal, fundRate, months, 'equal_interest');
      fundInterest = result.totalInterest;
    }

    // 等额本息数据
    const equalInterestResult = this.calculateLoan(totalPrincipal, 
      (commPrincipal * commRate + fundPrincipal * fundRate) / totalPrincipal, 
      months, 'equal_interest');

    // 等额本金数据
    const equalPrincipalResult = this.calculateLoan(totalPrincipal, 
      (commPrincipal * commRate + fundPrincipal * fundRate) / totalPrincipal, 
      months, 'equal_principal');

    return {
      equalInterest: {
        firstMonth: equalInterestResult.firstMonth.toFixed(0),
        totalInterest: (equalInterestResult.totalInterest / 10000).toFixed(2),
        totalPayment: (equalInterestResult.totalPayment / 10000).toFixed(2)
      },
      equalPrincipal: {
        firstMonth: equalPrincipalResult.firstMonth.toFixed(0),
        decreaseAmount: equalPrincipalResult.decreaseAmount.toFixed(0),
        totalInterest: (equalPrincipalResult.totalInterest / 10000).toFixed(2),
        totalPayment: (equalPrincipalResult.totalPayment / 10000).toFixed(2)
      }
    };
  },

  // 显示对比弹窗
  showComparison() {
    this.setData({ showModal: true });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  // 显示商贷利率选择弹窗
  showCommercialRateModal() {
    this.setData({ showCommercialRateModal: true });
  },

  // 关闭商贷利率选择弹窗
  closeCommercialRateModal() {
    this.setData({ showCommercialRateModal: false });
  },

  // 选择商贷利率
  selectCommercialRate(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      commercialRateIndex: index,
      commercialRate: COMMERCIAL_RATE_OPTIONS[index].value,
      showCommercialRateModal: false
    });
  },

  // 显示公积金利率选择弹窗
  showFundRateModal() {
    this.setData({ showFundRateModal: true });
  },

  // 关闭公积金利率选择弹窗
  closeFundRateModal() {
    this.setData({ showFundRateModal: false });
  },

  // 选择公积金利率
  selectFundRate(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      fundRateIndex: index,
      fundRate: FUND_RATE_OPTIONS[index].value,
      showFundRateModal: false
    });
  }
});