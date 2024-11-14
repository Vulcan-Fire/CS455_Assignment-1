class LoadBalancer {
  constructor(primaryServers) {
    this.primaryServers = primaryServers;
    this.currentIndex = 0;
  }

  getNextServer() {
    const server = this.primaryServers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.primaryServers.length;
    return server;
  }
}

const loadBalancer = new LoadBalancer([
  'https://cs455-assignment-1-khsw.onrender.com',
  'https://cs455-assignment-1-copy2-1.onrender.com'
]);

const formatUrl = (baseUrl, endpoint) => {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

export const loadBalancedFetch = async (endpoint, options = {}) => {
  const server = loadBalancer.getNextServer();
  const url = formatUrl(server, endpoint);
  
  console.log(`Requesting: ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Server': server,
      'X-Server-Type': 'primary'
    },
  });
  
  return response;
};
