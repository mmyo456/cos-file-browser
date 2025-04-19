const state = {
    currentPrefix: new URLSearchParams(window.location.search).get('prefix') || '',
    cosConfig: { bucket: '', region: '', customDomain: '' }
  };
  
  const elements = {
    fileTree: document.getElementById('file-tree'),
    fileList: document.getElementById('file-list'),
    breadcrumb: document.getElementById('breadcrumb'),
    backButton: document.getElementById('back-button'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    themeToggle: document.getElementById('theme-toggle')
  };
  
  // 主题切换
  elements.themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });
  
  // 初始化主题
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  
  async function fetchConfig() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('无法获取 COS 配置');
      state.cosConfig = await response.json();
      if (!state.cosConfig.bucket || !state.cosConfig.region) {
        throw new Error('COS 配置缺失（bucket 或 region）');
      }
    } catch (error) {
      elements.error.classList.remove('hidden');
      elements.error.textContent = `配置加载失败：${error.message}`;
      console.error('获取配置失败:', error);
      throw error;
    }
  }
  
  async function fetchFiles(prefix = '') {
    elements.loading.classList.remove('hidden');
    elements.error.classList.add('hidden');
    try {
      const response = await fetch(`/api/files?prefix=${encodeURIComponent(prefix)}`);
      if (!response.ok) throw new Error('网络请求失败');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      elements.error.classList.remove('hidden');
      elements.error.textContent = `无法加载文件列表：${error.message}`;
      console.error('获取文件列表失败:', error);
      return { Contents: [], CommonPrefixes: [] };
    } finally {
      elements.loading.classList.add('hidden');
    }
  }
  
  function renderFileTree(prefixes) {
    elements.fileTree.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'space-y-2';
    
    prefixes.forEach(prefix => {
      const li = document.createElement('li');
      const path = prefix.Prefix.split('/').filter(p => p).pop();
      li.innerHTML = `<span class="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline" onclick="navigateTo('${prefix.Prefix}')">${path}</span>`;
      ul.appendChild(li);
    });
    
    elements.fileTree.appendChild(ul);
  }
  
  function renderFileList(files) {
    elements.fileList.innerHTML = '';
    
    if (files.length === 0) {
      elements.fileList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">此目录为空</p>';
      return;
    }
    
    files.forEach(file => {
      const div = document.createElement('div');
      div.className = 'flex items-center p-3 border-b border-gray-200 dark:border-gray-700';
      
      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.Key);
      const baseUrl = state.cosConfig.customDomain || `https://${state.cosConfig.bucket}.cos.${state.cosConfig.region}.myqcloud.com`;
      const thumbnail = isImage 
        ? `<img src="${baseUrl}/${file.Key}?imageMogr2/thumbnail/100x" class="w-12 h-12 object-cover mr-3 rounded" alt="thumbnail" onerror="this.outerHTML='<div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 rounded text-xs text-gray-500">图片错误</div>'">`
        : `<div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 rounded text-xs text-gray-500">文件</div>`;
      
      div.innerHTML = `
        ${thumbnail}
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 dark:text-gray-100 truncate">${file.Key}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(file.LastModified).toLocaleString()}</p>
        </div>
        <button onclick="copyUrl('${baseUrl}/${file.Key}')" 
                class="ml-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
          复制 URL
        </button>
      `;
      elements.fileList.appendChild(div);
    });
  }
  
  function renderBreadcrumb(prefix) {
    elements.breadcrumb.innerHTML = '';
    const parts = prefix ? prefix.split('/').filter(p => p) : [];
    let currentPath = '';
  
    const rootSpan = document.createElement('span');
    rootSpan.innerHTML = `<span class="cursor-pointer hover:underline text-blue-600 dark:text-blue-400" onclick="navigateTo('')">root</span>`;
    elements.breadcrumb.appendChild(rootSpan);
  
    parts.forEach((part, index) => {
      currentPath += part + '/';
      const span = document.createElement('span');
      span.innerHTML = ` / <span class="cursor-pointer hover:underline text-blue-600 dark:text-blue-400" onclick="navigateTo('${currentPath}')">${part}</span>`;
      elements.breadcrumb.appendChild(span);
    });
  
    elements.backButton.disabled = prefix === '';
    elements.backButton.onclick = () => {
      if (prefix === '') return;
      const parts = prefix.split('/').filter(p => p);
      const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';
      navigateTo(parentPath);
    };
  }
  
  function copyUrl(url) {
    navigator.clipboard.writeText(url)
      .then(() => alert('URL 已复制到剪贴板'))
      .catch(err => console.error('复制失败:', err));
  }
  
  async function navigateTo(prefix) {
    state.currentPrefix = prefix;
    const url = new URL(window.location);
    url.searchParams.set('prefix', prefix);
    window.history.pushState({}, '', url);
    const data = await fetchFiles(prefix);
    renderFileTree(data.CommonPrefixes);
    renderFileList(data.Contents);
    renderBreadcrumb(prefix);
  }
  
  async function init() {
    try {
      await fetchConfig();
      await navigateTo(state.currentPrefix);
    } catch (error) {
      elements.error.classList.remove('hidden');
      elements.error.textContent = '初始化失败，请检查服务器配置';
    }
  }
  
  init();