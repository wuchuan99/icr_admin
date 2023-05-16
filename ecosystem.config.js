module.exports = {
  deploy: {
    dev: {
      user: 'root',
      host: '192.168.200.151',
      ref: 'origin/master',
      repo: 'git@192.168.200.101:chang.liang/icr_web_admin.git',
      path: '/root/www/icr-admin',
      'pre-deploy': 'npm install ',
      'post-deploy': 'export NODE_ENV=production && npm run build && mv dist /data/balance/nginx/admin/cdn -f'
    }
  }
}
