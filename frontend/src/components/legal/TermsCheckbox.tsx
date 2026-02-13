import React from 'react';

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ checked, onChange }) => {
  return (
    <div className="mt-6 px-2">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center w-6 h-6 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer absolute opacity-0 w-full h-full cursor-pointer"
          />
          <div className={`
            w-5 h-5 border-2 rounded-md transition-all duration-200
            ${checked 
              ? 'bg-primary border-primary' 
              : 'bg-white border-neutral-300 group-hover:border-primary'
            }
          `}>
            {checked && (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="flex-1 text-sm text-neutral-500 leading-relaxed">
          Нажимая «Продолжить», вы подтверждаете, что ознакомились с{' '}
          <a 
            href="/legal/terms.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Пользовательским соглашением
          </a>
          {' '}и даёте{' '}
          <a 
            href="/legal/privacy.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            согласие на обработку персональных данных
          </a>.
          <br />
          <span className="text-xs text-neutral-400 mt-1 block">
            Номер телефона будет использоваться как уникальный идентификатор вашего аккаунта.
          </span>
        </span>
      </label>
    </div>
  );
};

export default TermsCheckbox;
