import { auth } from '../lib/firebase';
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
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  let friendlyMessage = "Une erreur est survenue.";
  
  const errorCode = error?.code;
  
  if (errorCode === 'permission-denied') {
    friendlyMessage = "Permissions insuffisantes.";
  } else if (errorCode === 'unavailable') {
    friendlyMessage = "Connexion réseau instable.";
  } else if (errorCode === 'unauthenticated') {
    friendlyMessage = "Veuillez vous reconnecter.";
  } else {
    friendlyMessage = "Erreur temporaire du serveur.";
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  toast.error(friendlyMessage);
  
  return friendlyMessage;
}
