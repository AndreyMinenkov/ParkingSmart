import React, { useState, useEffect } from 'react';
import { blockersAPI, callsAPI } from '../services/api';
import type { Blocker } from '../types';

interface BlockersScreenProps {
  onClose: () => void;
}

const BlockersScreen: React.FC<BlockersScreenProps> = ({ onClose }) => {
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBlockers();
  }, []);

  const loadBlockers = async () => {
    setIsLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const response = await blockersAPI.getNearby(
        position.coords.latitude,
        position.coords.longitude
      );
      setBlockers(response.data.blockers);
    } catch (error) {
      console.error('Ошибка загрузки блокирующих:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markCall = async (blockerId: number) => {
    try {
      await callsAPI.mark({ blockerId });
      setBlockers(blockers.map(b => 
        b.id === blockerId 
          ? { ...b, hasBeenCalled: true, calledAt: new Date().toISOString() }
          : b
      ));
    } catch (error) {
      console.error('Ошибка отметки звонка:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center animate-fade-in z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-6" />

          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-primary border-t-transparent" />
              <p className="mt-4 text-neutral-400">Проверяем ближайшие машины...</p>
            </div>
          ) : blockers.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Выезд свободен
              </h3>
              <p className="text-neutral-400 mb-8">
                В радиусе 4 метров нет машин, которые вас блокируют
              </p>
              <button
                onClick={onClose}
                className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
              >
                Отлично
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {blockers.length === 1 ? 'Найден блокирующий' : 'Найдены блокирующие'}
                </h3>
                <p className="text-neutral-400">
                  Эти водители отметили, что могут блокировать выезд
                </p>
              </div>

              <div className="space-y-4">
                {blockers.map((blocker) => (
                  <div
                    key={blocker.id}
                    className={`p-4 rounded-xl border ${
                      blocker.hasBeenCalled
                        ? 'border-success/30 bg-success/5'
                        : 'border-error/30 bg-error/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        blocker.hasBeenCalled ? 'bg-success' : 'bg-error'
                      }`} />
                      <span className="text-xs font-medium text-neutral-500">
                        {blocker.hasBeenCalled
                          ? 'Уже звонили'
                          : 'Блокирует выезд'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xl font-bold text-neutral-900 tracking-wider">
                          {blocker.encryptedPhone}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          {blocker.hasBeenCalled
                            ? `Кто-то позвонил ${formatTimeAgo(blocker.calledAt!)}`
                            : `Отметил ${formatTimeAgo(blocker.createdAt)}`
                          }
                        </div>
                      </div>
                      
                      <a
                        href={`tel:${blocker.phone}`}
                        onClick={() => markCall(blocker.id)}
                        className="h-12 px-5 bg-primary text-white font-semibold rounded-xl flex items-center gap-2 hover:bg-primary-dark active:scale-[0.98] transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Позвонить
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Как звонить:</span><br />
                  «Здравствуйте, я из ParkingSmart. Вы отметили,<br />
                  что можете блокировать выезд. Не могли бы вы<br />
                  подойти к машине?»
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full h-12 text-center text-primary font-medium mt-6 hover:text-primary-dark transition-colors"
              >
                Закрыть
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockersScreen;
