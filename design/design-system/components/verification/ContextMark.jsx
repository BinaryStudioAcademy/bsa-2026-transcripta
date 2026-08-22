import React from 'react';
export function ContextMark({tip='from the lexicon',children,...rest}){
  return <mark className="tx-mark tx-tip" data-tip={tip} tabIndex={0} {...rest}>{children}</mark>;
}
