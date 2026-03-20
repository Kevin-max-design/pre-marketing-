import { supabase } from '../lib/supabase';

export const checkHealth = async () => {
  // Using Supabase, the health check can just verify client initialization
  return { status: 'ok', message: 'Supabase client running' };
};

export const signup = async (data: {
  email: string;
  name: string;
  role: string;
  password?: string;
  city?: string;
  industry?: string;
  investmentRange?: string;
}) => {
  if (!data.password) throw new Error('Password is required');
  
  const [firstName, ...lastNameParts] = data.name.split(' ');
  const lastName = lastNameParts.join(' ');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName || '',
        role: data.role.toUpperCase(),
        industry: data.industry,
        investment_range: data.investmentRange,
        city: data.city,
      }
    }
  });

  if (authError) throw new Error(authError.message);
  
  // Return a structure compatible with the existing frontend
  return { 
    success: true, 
    user: { 
      id: authData.user?.id, 
      email: authData.user?.email, 
      name: data.name, 
      role: data.role.toUpperCase() 
    } 
  };
};

export const login = async (email: string, password?: string) => {
  if (!password) throw new Error('Password is required');
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw new Error(authError.message);

  const [profile, investorProfile] = await Promise.all([
    supabase.from('founder').select('*').eq('id', authData.user.id).single(),
    supabase.from('investor').select('*').eq('id', authData.user.id).single()
  ]);

  const existingProfile = profile.data || investorProfile.data;
  const role = profile.data ? 'FOUNDER' : (investorProfile.data ? 'INVESTOR' : 'FOUNDER');

  return { 
    success: true, 
    user: { 
      id: authData.user.id, 
      email: authData.user.email, 
      name: existingProfile ? (existingProfile.first_name || 'Waitlist Entry') : '', 
      role: existingProfile ? (existingProfile.role || role) : role
    } 
  };
};

export const fetchUsers = async () => {
  const [founders, investors] = await Promise.all([
    supabase.from('founder').select('*'),
    supabase.from('investor').select('*')
  ]);
  return [
    ...(founders.data || []).map((f: any) => ({ ...f, role: 'FOUNDER', first_name: f.first_name || 'Waitlist', last_name: f.last_name || 'Entry' })),
    ...(investors.data || []).map((i: any) => ({ ...i, role: 'INVESTOR', first_name: i.first_name || 'Waitlist', last_name: i.last_name || 'Entry' }))
  ];
};

export const fetchUser = async (id: string) => {
  // Check both tables
  const [f, i] = await Promise.all([
    supabase.from('founder').select('*').eq('id', id).single(),
    supabase.from('investor').select('*').eq('id', id).single()
  ]);
  if (f.data) return { ...f.data, role: 'FOUNDER' };
  if (i.data) return { ...i.data, role: 'INVESTOR' };
  throw new Error("User not found");
};

export const updateUser = async (id: string, updateData: any) => {
  // Determine which table based on current role or just try both
  const { role, ...cleanData } = updateData;
  const table = role?.toLowerCase() === 'investor' ? 'investor' : 'founder';
  const { data, error } = await supabase
    .from(table)
    .update(cleanData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const deleteProfile = async (id: string) => {
  // Delete from both to be safe
  await Promise.all([
    supabase.from('founder').delete().eq('id', id),
    supabase.from('investor').delete().eq('id', id)
  ]);
  return { success: true };
};

export const fetchAllProfiles = async () => {
  const [foundersRes, investorsRes] = await Promise.all([
    supabase.from('founder').select('*').order('created_at', { ascending: false }),
    supabase.from('investor').select('*').order('created_at', { ascending: false })
  ]);

  const fData = (foundersRes.data || []).map((f: any) => ({ ...f, role: 'FOUNDER', first_name: f.first_name || 'Waitlist', last_name: f.last_name || 'Entry' }));
  const iData = (investorsRes.data || []).map((i: any) => ({ ...i, role: 'INVESTOR', first_name: i.first_name || 'Waitlist', last_name: i.last_name || 'Entry' }));

  return [...fData, ...iData].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const fetchGlobalStats = async () => {
  const [foundersRes, investorsRes] = await Promise.all([
    supabase.from('founder').select('id'),
    supabase.from('investor').select('id')
  ]);

  const founders = foundersRes.data || [];
  const investors = investorsRes.data || [];
  
  const stats = {
    total: founders.length + investors.length,
    founders: founders.length,
    investors: investors.length,
    admins: 0 // No admins tracked in these tables
  };
  
  return stats;
};

// Simple email masking for sensitive data display
export const maskEmail = (email: string) => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
};
