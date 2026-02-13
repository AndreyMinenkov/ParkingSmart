import React, { useState } from 'react';

interface ParkingConfirmationSheetProps {
  onConfirm: (isBlocking: boolean) => void;
  onClose: () => void;
}

const ParkingConfirmationSheet: React.FC<ParkingConfirmationSheetProps> = ({ onConfirm, onClose }) => {
  const [showBlockingWarning, setShowBlockingWarning] = useState(false);
  const [pendingBlocking, setPendingBlocking] = useState(false);

  // Обработчик клика по затемнению (бэкдропу)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClose();
  };

  // Предотвращаем закрытие при клике внутри самой панели
  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleBlockingClick = () => {
    setPendingBlocking(true);
    setShowBlockingWarning(true);
  };

  const handleConfirmBlocking = () => {
    setShowBlockingWarning(false);
    onConfirm(true);
  };

  const handleCancelBlocking = () => {
    setShowBlockingWarning(false);
    setPendingBlocking(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center animate-fade-in z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-2xl animate-slide-up"
        onClick={handleSheetClick}
      >
        <div className="p-6">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-6" />

          {!showBlockingWarning ? (
            <>
              <h3 className="text-xl font-bold text-center text-neutral-900 mb-8">
                Как вы паркуетесь?
              </h3>

              <div className="space-y-4">
                {/* Не блокирую */}
                <button
                  onClick={() => onConfirm(false)}
                  className="w-full p-5 border-2 border-success/30 rounded-xl hover:border-success hover:bg-success/5 active:scale-[0.98] transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-success group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900 text-lg">
                        Не блокирую
                      </p>
                      <p className="text-sm text-neutral-400 mt-1">
                        Никому не мешаю, проезд свободен
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-success opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Блокирую */}
                <button
                  onClick={handleBlockingClick}
                  className="w-full p-5 border-2 border-error/30 rounded-xl hover:border-error hover:bg-error/5 active:scale-[0.98] transition-all text-left group"    
                >
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-error group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900 text-lg">
                        Блокирую выезд
                      </p>
                      <p className="text-sm text-neutral-400 mt-1">
                        Готов к звонку, если кому-то понадобится выехать
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"       
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="py-4 animate-fade-in">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-center text-neutral-900 mb-3">
                Вы блокируете выезд?
              </h3>
              
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Вы подтверждаете, что ваш автомобиль физически блокирует выезд другим водителям.
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed mt-2 font-medium">
                  Ваш зашифрованный номер телефона будет виден другим пользователям в радиусе 4 метров при их запросе на выезд.
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed mt-2">
                  Вы готовы к звонку и готовы подойти к машине, если кому-то понадобится выехать.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelBlocking}
                  className="flex-1 h-12 border-2 border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmBlocking}
                  className="flex-1 h-12 bg-error text-white rounded-xl font-medium hover:bg-error/90 active:scale-[0.98] transition-all shadow-lg"
                >
                  Подтверждаю
                </button>
              </div>
            </div>
          )}

          {!showBlockingWarning && (
            <button
              onClick={onClose}
              className="w-full h-12 text-center text-neutral-400 font-medium mt-8 hover:text-neutral-600 transition-colors"
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingConfirmationSheet;
