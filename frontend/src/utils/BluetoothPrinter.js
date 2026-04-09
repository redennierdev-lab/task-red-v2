import { Capacitor } from '@capacitor/core';

/**
 * BluetoothPrinter.js
 * Utilidad para imprimir en mini-impresoras térmicas Bluetooth.
 *
 * En Android (APK con Capacitor), usa el bridge nativo window.BluetoothSerial
 * que es inyectado por el plugin cordova-plugin-bluetooth-serial si está instalado.
 * En web / entornos sin Native bridge, hace fallback al diálogo del sistema.
 */

const isAndroidNative = () => Capacitor.isNativePlatform();

// Helper to check/request permissions on Android 12+
const checkPermissions = async () => {
  if (!isAndroidNative()) return true;
  const permissions = window.plugins?.permissions;
  if (!permissions) return true;

  const list = [
    permissions.BLUETOOTH_SCAN,
    permissions.BLUETOOTH_CONNECT,
    permissions.ACCESS_FINE_LOCATION
  ];

  return new Promise((resolve) => {
    permissions.hasPermission(list[0], (status) => {
      if (status.hasPermission) {
        resolve(true);
      } else {
        permissions.requestPermissions(list, 
          (s) => resolve(s.hasPermission),
          () => resolve(false)
        );
      }
    }, () => resolve(false));
  });
};

const BluetoothPrinter = {
  // Lista dispositivos Bluetooth YA VINCULADOS en el sistema Android
  listDevices: async () => {
    if (isAndroidNative()) {
      if (!window.BluetoothSerial) {
        console.warn("Plugin BluetoothSerial no detectado.");
        return [];
      }
      
      // Asegurar permisos antes de listar
      await checkPermissions();

      return new Promise((resolve) => {
        window.BluetoothSerial.list(
          (devices) => resolve(devices || []),
          () => resolve([])
        );
      });
    }
    return [{ name: 'DEMO PRINTER (Web)', address: '00:11:22:33:44:55' }];
  },

  // Escanear dispositivos NO VINCULADOS (Descubrimiento)
  discoverNew: async () => {
    if (isAndroidNative()) {
      if (!window.BluetoothSerial) return [];
      
      await checkPermissions();

      return new Promise((resolve) => {
        window.BluetoothSerial.discoverUnpaired(
          (devices) => resolve(devices || []),
          () => resolve([])
        );
      });
    }
    return [];
  },

  // Conectar a dirección MAC
  connect: async (address) => {
    if (isAndroidNative()) {
      if (!window.BluetoothSerial) return false;
      return new Promise((resolve) => {
        window.BluetoothSerial.connect(
          address,
          () => resolve(true),
          () => resolve(false)
        );
      });
    }
    return true; // En web siempre retorna true para el fallback
  },

  // Enviar texto crudo ESC/POS
  printRaw: async (text) => {
    // Null safety para prevenir "Reading a NULL string not supported here" en el bridge nativo
    const safeText = text ? String(text) : '';
    const output = safeText + '\n\n\n';

    if (isAndroidNative()) {
      if (!window.BluetoothSerial) {
          console.error("BluetoothSerial no disponible.");
          return false;
      }
      // Chunking preventivo para evadir "Binder transaction failure" (Límite ~1MB)
      const CHUNK_SIZE = 200000; 

      if (output.length <= CHUNK_SIZE) {
        return new Promise((resolve) => {
          window.BluetoothSerial.write(
            output,
            () => resolve(true),
            () => resolve(false)
          );
        });
      } else {
        let success = true;
        for (let i = 0; i < output.length; i += CHUNK_SIZE) {
          const chunk = output.substring(i, i + CHUNK_SIZE);
          const chunkSuccess = await new Promise((resolve) => {
             window.BluetoothSerial.write(
               chunk,
               () => resolve(true),
               () => resolve(false)
             );
          });
          if (!chunkSuccess) success = false;
        }
        return success;
      }
    }
    
    // Fallback en web: usar diálogo del sistema
    try {
      window.print();
    } catch(e) {
      console.warn("Print fallback fallido:", e);
    }
    return true;
  },

  // Verificar si el Bluetooth está activo
  checkBT: async () => {
    if (isAndroidNative()) {
      if (!window.BluetoothSerial) return false;
      return new Promise((resolve) => {
        window.BluetoothSerial.isEnabled(
          () => resolve(true),
          () => resolve(false)
        );
      });
    }
    return true;
  },

  // Solicitar al usuario que active el Bluetooth
  enable: async () => {
    if (isAndroidNative()) {
      if (!window.BluetoothSerial) return false;
      
      // Intento persistente de activación
      let attempts = 0;
      let enabled = await BluetoothPrinter.checkBT();
      
      while (!enabled && attempts < 3) {
        enabled = await new Promise((resolve) => {
          window.BluetoothSerial.enable(
            () => resolve(true),
            () => resolve(false)
          );
        });
        if (!enabled) {
          // Si el usuario cancela, volvemos a preguntar si sigue interesado
          const retry = window.confirm("La aplicación insiste: El Bluetooth es necesario para imprimir. ¿Deseas activarlo ahora?");
          if (!retry) break;
        }
        attempts++;
      }
      return enabled;
    }
    return true;
  },

  // Función maestra para asegurar que todo está listo
  prepareSystem: async () => {
    if (!isAndroidNative()) return true;
    
    // 1. Permisos
    const hasPerms = await checkPermissions();
    if (!hasPerms) {
      alert("La aplicación requiere permisos de 'Dispositivos Cercanos' para funcionar con la impresora.");
      return false;
    }

    // 2. Bluetooth Activo
    const btOn = await BluetoothPrinter.enable();
    if (!btOn) {
      alert("No se puede imprimir sin Bluetooth activado.");
      return false;
    }

    return true;
  },

  // Desconectar
  disconnect: async () => {
    if (isAndroidNative()) {
      if (!window.BluetoothSerial) return;
      return new Promise((resolve) => {
        window.BluetoothSerial.disconnect(() => resolve(), () => resolve());
      });
    }
  },
};

export default BluetoothPrinter;
