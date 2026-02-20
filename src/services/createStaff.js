import functions from '@react-native-firebase/functions';

/**
 * Call Cloud Function createStaff (owner creates staff with email/password).
 * Caller must be logged in as OWNER with a shopId.
 * @param {{ email: string, password: string, name: string, shopId: string, permissions?: Object }}
 * @returns {Promise<{ uid: string, email: string, message: string }>}
 */
export async function createStaff({ email, password, name, shopId, permissions = {} }) {
  const createStaffCallable = functions().httpsCallable('createStaff');
  const result = await createStaffCallable({
    email,
    password,
    name,
    shopId,
    permissions,
  });
  return result.data;
}
