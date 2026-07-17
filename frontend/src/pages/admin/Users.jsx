import React, { useState, useEffect } from 'react';
import { userService } from '../../api/services';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { ToggleLeft, ToggleRight, ShieldCheck, Edit2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await userService.adminGetUsers(0, 100);
      if (res.success && res.data?.content) {
        setUsers(res.data.content);
      }
    } catch (err) {
      console.warn('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userItem) => {
    const nextActive = !userItem.active;
    try {
      const res = await userService.adminToggleUserStatus(userItem.id, nextActive);
      if (res.success) {
        toast.success(`User successfully ${nextActive ? 'activated' : 'deactivated'}.`);
        setUsers(prev => 
          prev.map(u => u.id === userItem.id ? { ...u, active: nextActive } : u)
        );
      }
    } catch (err) {
      toast.error("Failed to toggle user status.");
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    try {
      const res = await userService.adminChangeRole(userId, nextRole);
      if (res.success) {
        toast.success("User role modified successfully!");
        setUsers(prev => 
          prev.map(u => u.id === userId ? { ...u, roles: [nextRole] } : u)
        );
      }
    } catch (err) {
      toast.error("Failed to update user role.");
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchVal.toLowerCase()) ||
    u.email.toLowerCase().includes(searchVal.toLowerCase())
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Admin Sidebar */}
        <Sidebar isAdmin />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          
          {/* Header */}
          <div className="pb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold">Manage Platform Users</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Audit profile records, change access roles, and disable accounts.</p>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-3">User Profile</th>
                  <th className="py-4 px-3">Role</th>
                  <th className="py-4 px-3">Date Registered</th>
                  <th className="py-4 px-3">Verification</th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-4 px-3">
                      <h4 className="font-bold text-slate-850 dark:text-white">{u.firstName} {u.lastName}</h4>
                      <span className="text-xs text-slate-450 font-normal">{u.email}</span>
                    </td>
                    <td className="py-4 px-3">
                      <select
                        value={u.roles?.[0] || 'ADOPTER'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 text-xs font-semibold focus:outline-none text-slate-655 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="ADOPTER">Adopter</option>
                        <option value="OWNER">Owner</option>
                        <option value="SHELTER">Shelter</option>
                        <option value="NGO">NGO</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-3 text-xs text-slate-500 font-normal">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.active ? 'bg-success/15 text-success' : 'bg-red-500/10 text-red-650'
                      }`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-light"
                        title={u.active ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.active ? <ToggleRight size={28} className="text-primary shrink-0" /> : <ToggleLeft size={28} className="text-slate-400 shrink-0" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
