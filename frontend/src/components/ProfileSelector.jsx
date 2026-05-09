import { User, ShieldCheck } from 'lucide-react';

export default function ProfileSelector({ onSelect }) {
  const profiles = [
    {
      id: 'admin',
      name: 'Admin',
      icon: <ShieldCheck className="w-16 h-16" />,
      color: 'bg-red-600',
      description: 'Manage tasks & teams'
    },
    {
      id: 'user',
      name: 'Member',
      icon: <User className="w-16 h-16" />,
      color: 'bg-blue-600',
      description: 'View & update tasks'
    }
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center animate-fade-in">
      <h1 className="text-white text-4xl md:text-5xl font-medium mb-12">Who's working?</h1>
      
      <div className="flex flex-wrap justify-center gap-8 px-4">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelect(profile.id)}
            className="group flex flex-col items-center gap-4 focus:outline-none"
          >
            <div className={`relative w-32 h-32 md:w-40 md:h-40 ${profile.color} rounded-lg flex items-center justify-center 
              transition-all duration-300 border-4 border-transparent group-hover:border-white group-focus:border-white shadow-2xl`}>
              <div className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                {profile.icon}
              </div>
            </div>
            <div className="text-center">
              <span className="text-slate-400 text-xl group-hover:text-white transition-colors">{profile.name}</span>
              <p className="text-slate-600 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{profile.description}</p>
            </div>
          </button>
        ))}
      </div>

      <button className="mt-20 px-8 py-2 border border-slate-600 text-slate-600 hover:text-white hover:border-white transition-all uppercase tracking-widest text-sm">
        Manage Profiles
      </button>
    </div>
  );
}
