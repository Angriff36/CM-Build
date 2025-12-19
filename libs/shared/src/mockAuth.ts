// Mock authentication for demo purposes
export const MOCK_USERS = {
  'alice@caterking.com': {
    id: '550e8400-e29b-41d4-a716-446655440104',
    email: 'alice@caterking.com',
    role: 'staff',
    display_name: 'Alice Staff',
    company_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  },
  'sarah@caterking.com': {
    id: '550e8400-e29b-41d4-a716-446655440102',
    email: 'sarah@caterking.com',
    role: 'manager',
    display_name: 'Sarah Manager',
    company_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  },
  'john@caterking.com': {
    id: '550e8400-e29b-41d4-a716-446655440101',
    email: 'john@caterking.com',
    role: 'owner',
    display_name: 'John Owner',
    company_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  },
};

export function mockAuth(email: string, password: string) {
  // For demo, accept any password for mock users
  const user = MOCK_USERS[email as keyof typeof MOCK_USERS];
  if (user && password.length > 0) {
    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          company_id: user.company_id,
          role: user.role,
          display_name: user.display_name,
        },
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            company_id: user.company_id,
            role: user.role,
            display_name: user.display_name,
          },
        },
      },
    };
  }
  return { user: null, session: null };
}
