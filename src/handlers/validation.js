const emailRegexp = /^[\w-.]+@([\w-]+\.)+[\w-]+$/;
const passwordRegexp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])\S{6,12}$/;

const validateEmail = (data) => {
  const userName = data.slice(0, data.indexOf('@'));
  const domainName = data.slice(data.indexOf('@') + 1);

  return emailRegexp.test(data)
    && !data.includes('..')
    && !data.includes('--')
    && !data.includes('__')
    && !data.includes('-.')
    && !data.includes('.-')
    && !data.includes('_.')
    && !data.includes('._')
    && !/^\./.test(userName)
    && !/\.$/.test(userName)
    && !/^-/.test(userName)
    && !/-$/.test(userName)
    && !/^_/.test(userName)
    && !/_$/.test(userName)
    && !/^-/.test(domainName)
    && !/-$/.test(domainName)
    && !/^_/.test(domainName)
    && !/_$/.test(domainName);
};

const validatePassword = (data) => passwordRegexp.test(data);

module.exports = {
  validateEmail,
  validatePassword,
};
