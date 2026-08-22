import React from 'react';
export function Button({variant='primary',size='md',children,...rest}){
  const cls=['tx-btn','tx-btn--'+variant];
  if(size!=='md')cls.push('tx-btn--'+size);
  return <button className={cls.join(' ')} {...rest}>{children}</button>;
}
