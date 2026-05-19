import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export enum OperationType {
  CREATE = 'Création',
  UPDATE = 'Modification',
  DELETE = 'Suppression',
  LIST = 'Liste',
  GET = 'Récupération',
  WRITE = 'Écriture',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  let friendlyMessage = "Une erreur est survenue.";

  const errorCode = error?.code || error?.message || '';

  if (errorCode.includes('permission') || errorCode.includes('403')) {
    friendlyMessage = "Permissions insuffisantes.";
  } else if (errorCode.includes('network') || errorCode.includes('unavailable')) {
    friendlyMessage = "Connexion réseau instable.";
  } else if (errorCode.includes('unauthenticated') || errorCode.includes('401')) {
    friendlyMessage = "Veuillez vous reconnecter.";
  } else {
    friendlyMessage = "Erreur temporaire du serveur.";
  }

  supabase.auth.getUser().then(({ data: { user } }) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.id,
        email: user?.email
      },
      operationType,
      path
    };
    console.error('DB Error Detailed: ', JSON.stringify(errInfo));
  });

  toast.error(friendlyMessage);
  return friendlyMessage;
}
