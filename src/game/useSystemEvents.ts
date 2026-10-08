import { useEffect, useRef } from 'react';
import { AppState, BackHandler, Platform } from 'react-native';

type Handlers = {
  // Botón atrás de Android (o Escape en web). Devuelve true si lo manejó el juego.
  onBack: () => boolean;
  // La app pasó a segundo plano: llamadas, notificaciones, cambio de app.
  onBackground: () => void;
};

export function useSystemEvents(handlers: Handlers) {
  const ref = useRef(handlers);

  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => ref.current.onBack());
    const appState = AppState.addEventListener('change', (state) => {
      if (state !== 'active') ref.current.onBackground();
    });

    // En web, AppState ya avisa cuando se cambia de pestaña; falta solo el teclado.
    let removeWeb = () => {};
    if (Platform.OS === 'web') {
      const keyDown = (e: KeyboardEvent) => {
        if ((e.key === 'Escape' || e.key === 'p') && ref.current.onBack()) e.preventDefault();
      };
      window.addEventListener('keydown', keyDown);
      removeWeb = () => window.removeEventListener('keydown', keyDown);
    }

    return () => {
      back.remove();
      appState.remove();
      removeWeb();
    };
  }, []);
}
