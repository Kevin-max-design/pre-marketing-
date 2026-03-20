import { supabase } from '@/lib/supabase';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  return { 
    success: true, 
    user: { 
      id: authData.user.id, 
      email: authData.user.email, 
      name: profile ? `${profile.first_name} ${profile.last_name}` : '', 
      role: profile ? profile.role : 'FOUNDER' 
    } 
  };
};

export const fetchUsers = async () => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const fetchUser = async (id: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateUser = async (id: string, updateData: Record<string, string>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};
export const deleteProfile = async (id: string) => {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const fetchAllProfiles = async () => {
  const [profilesRes, foundersRes, investorsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('founder').select('*').order('created_at', { ascending: false }),
    supabase.from('investor').select('*').order('created_at', { ascending: false })
  ]);

  const pData = profilesRes.data || [];
  const fData = (foundersRes.data || []).map(f => ({ ...f, role: 'FOUNDER', first_name: 'Waitlist', last_name: 'Entry' }));
  const iData = (investorsRes.data || []).map(i => ({ ...i, role: 'INVESTOR', first_name: 'Waitlist', last_name: 'Entry' }));

  // Combine and remove duplicates by email if necessary, but for now just concat
  return [...pData, ...fData, ...iData].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const fetchGlobalStats = async () => {
  const [profilesRes, foundersRes, investorsRes] = await Promise.all([
    supabase.from('profiles').select('role'),
    supabase.from('founder').select('id'),
    supabase.from('investor').select('id')
  ]);

  const profiles = profilesRes.data || [];
  const waitlistFounders = foundersRes.data || [];
  const waitlistInvestors = investorsRes.data || [];
  
  const stats = {
    total: profiles.length + waitlistFounders.length + waitlistInvestors.length,
    founders: profiles.filter((p: any) => p.role === 'FOUNDER').length + waitlistFounders.length,
    investors: profiles.filter((p: any) => p.role === 'INVESTOR').length + waitlistInvestors.length,
    admins: profiles.filter((p: any) => p.role === 'ADMIN').length
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
