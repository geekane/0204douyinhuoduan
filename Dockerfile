# 使用轻量级 Node.js 镜像
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm install --production

# 复制必要的源代码文件
COPY server.js ./

# 创建.env文件的占位符（实际环境变量通过运行时注入）
# 不要在镜像中包含真实的.env文件

# 暴露端口（改为3001以匹配server.js的默认配置）
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["node", "server.js"]
