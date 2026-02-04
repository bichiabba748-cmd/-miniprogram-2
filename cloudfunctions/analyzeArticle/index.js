const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const { content } = event;
    
    if (!content) {
      return {
        success: false,
        message: '文案内容不能为空'
      };
    }
    
    const analysis = analyzeArticle(content);
    
    return {
      success: true,
      data: {
        analysis: analysis
      }
    };
    
  } catch (err) {
    console.error('AI拆解失败:', err);
    return {
      success: false,
      message: '拆解失败，请重试',
      error: err.message
    };
  }
};

function analyzeArticle(content) {
  const hook = extractHook(content);
  const trust = extractTrust(content);
  const action = extractAction(content);
  
  return {
    hook: hook,
    trust: trust,
    action: action
  };
}

function extractHook(content) {
  const hookPatterns = [
    /.*?90%.*?不知道.*?/i,
    /.*?只有.*?个.*?敢.*?/i,
    /.*?今天.*?这套房.*?/i,
    /.*?这.*?个.*?坑.*?/i,
    /.*?重大变化.*?/i,
    /.*?3句话.*?/i,
    /.*?3个技巧.*?/i,
    /.*?3个公式.*?/i
  ];
  
  for (const pattern of hookPatterns) {
    const match = content.match(pattern);
    if (match) {
      return `开场钩子：制造悬念"${match[0]}"`;
    }
  }
  
  return '开场钩子：需要优化，建议使用"90%的人都不知道"等悬念式开场';
}

function extractTrust(content) {
  const trustPatterns = [
    /.*?距离.*?米.*?/i,
    /.*?分钟.*?/i,
    /.*?万.*?/i,
    /.*?平.*?/i,
    /.*?套.*?/i,
    /.*?重点.*?/i,
    /.*?名校.*?/i,
    /.*?划片.*?/i,
    /.*?落户.*?/i,
    /.*?学位.*?/i,
    /.*?契税.*?/i,
    /.*?个税.*?/i,
    /.*?增值税.*?/i
  ];
  
  let trustPoints = [];
  for (const pattern of trustPatterns) {
    const matches = content.match(new RegExp(pattern.source, 'gi'));
    if (matches) {
      trustPoints.push(...matches);
    }
  }
  
  if (trustPoints.length > 0) {
    return `信任构建：使用具体数据${trustPoints.slice(0, 3).join('、')}建立专业可信度`;
  }
  
  return '信任构建：建议添加具体数据（如距离、价格、面积等）来增强可信度';
}

function extractAction(content) {
  const actionPatterns = [
    /.*?扣.*?1.*?/i,
    /.*?扣.*?666.*?/i,
    /.*?回复.*?/i,
    /.*?关注.*?/i,
    /.*?看房.*?/i,
    /.*?咨询.*?/i
  ];
  
  for (const pattern of actionPatterns) {
    const match = content.match(pattern);
    if (match) {
      return `行动号召：明确行动指令"${match[0]}"引导客户互动`;
    }
  }
  
  return '行动号召：建议添加明确的行动指令（如"扣1""回复""关注"）';
}
