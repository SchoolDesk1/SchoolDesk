// Quick Dashboard Generator - Adds ALL missing tabs
const fs = require('fs');

const currentDashboard = fs.readFileSync('client/src/pages/SchoolAdmin/Dashboard.jsx', 'utf8');

// Find where to insert (before subscription tab)
const insertPoint = currentDashboard.indexOf('{activeTab === \'subscription\'');

const part1 = currentDashboard.substring(0, insertPoint);

// ALL MISSING TAB SECTIONS
const missingTabs = `
                {/* TEACHERS TAB */}
                {activeTab === 'teachers' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">👨‍🏫</span> Teacher Management
                        </h2>
                        <div className="bg-white p-6 rounded-xl shadow-xl mb-6">
                            <h3 className="font-bold text-xl mb-4">Add Teacher</h3>
                            <form onSubmit={handleCreateTeacher} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" required value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className="p-3 border-2 rounded-lg" placeholder="Name" />
                                    <input type="tel" required value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} className="p-3 border-2 rounded-lg" placeholder="Phone" />
                                    <select required value={newTeacher.class_id} onChange={e => setNewTeacher({...newTeacher, class_id: e.target.value})} className="p-3 border-2 rounded-lg">
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold">Add Teacher</button>
                            </form>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {teachers.map(t => (
                                <div key={t.id} className="bg-white p-5 rounded-xl shadow-lg">
                                    <h3 className="font-bold text-lg">{t.name}</h3>
                                    <p>📞 {t.phone}</p>
                                    {t.class_name && <p className="bg-indigo-100 px-2 py-1 rounded inline-block mt-2">📚 {t.class_name}</p>}
                                    <button onClick={() => handleDeleteTeacher(t.id)} className="text-red-600 mt-2">🗑️ Delete</button>
                                </div>
                            ))}
                        </div>
                        {teachers.length === 0 && <div className="text-center py-20"><div className="text-6xl mb-4">👨‍🏫</div><p className="text-gray-400">No teachers yet</p></div>}
                    </div>
                )}

                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">📚</span> Class Management
                        </h2>
                        <div className="bg-white p-6 rounded-xl shadow-xl mb-6">
                            <h3 className="font-bold text-xl mb-4">Create New Class</h3>
                            <form onSubmit={handleCreateClass} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" required value={newClassName} onChange={e => setNewClassName(e.target.value)} className="p-3 border-2 rounded-lg" placeholder="Class Name (e.g., Class 10)" />
                                    <input type="password" required value={classPassword} onChange={e => setClassPassword(e.target.value)} className="p-3 border-2 rounded-lg" placeholder="Class Password" />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold">Create Class</button>
                            </form>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {classes.map(c => (
                                <div key={c.id} className="bg-white p-6 rounded-xl shadow-lg text-center">
                                    <div className="text-4xl mb-3">📚</div>
                                    <h3 className="font-bold text-lg">{c.class_name}</h3>
                                    <p className="text-sm text-gray-500 mt-2">Password: {c.class_password}</p>
                                </div>
                            ))}
                        </div>
                        {classes.length === 0 && <div className="text-center py-20"><div className="text-6xl mb-4">📚</div><p className="text-gray-400">No classes yet</p></div>}
                    </div>
                )}

                {/* NOTICES TAB */}
                {activeTab === 'notices' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">📢</span> Notices
                        </h2>
                        <div className="bg-white p-6 rounded-xl shadow-xl mb-6">
                            <h3 className="font-bold text-xl mb-4">Post New Notice</h3>
                            <form onSubmit={handleCreateNotice} className="space-y-4">
                                <textarea required value={newNotice.text} onChange={e => setNewNotice({...newNotice, text: e.target.value})} className="w-full p-3 border-2 rounded-lg" rows="3" placeholder="Notice text..."></textarea>
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={newNotice.classId} onChange={e => setNewNotice({...newNotice, classId: e.target.value})} className="p-3 border-2 rounded-lg">
                                        <option value="">All Classes</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                    </select>
                                    <select value={newNotice.duration} onChange={e => setNewNotice({...newNotice, duration: e.target.value})} className="p-3 border-2 rounded-lg">
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                        <option value="30">30 Days</option>
                                    </select>
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold">Post Notice</button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            {notices.map(n => (
                                <div key={n.id} className="bg-white p-5 rounded-xl shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-gray-800">{n.notice_text}</p>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                <span>📅 {new Date(n.posted_date).toLocaleDateString()}</span>
                                                {n.class_name && <span>📚 {n.class_name}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteNotice(n.id)} className="text-red-600">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {notices.length === 0 && <div className="text-center py-20"><div className="text-6xl mb-4">📢</div><p className="text-gray-400">No notices yet</p></div>}
                    </div>
                )}

                {/* FEES TAB */}
                {activeTab === 'fees' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">💰</span> Fee Management
                        </h2>
                        <div className="mb-4">
                            <select value={feeFilter} onChange={e => setFeeFilter(e.target.value)} className="p-3 border-2 rounded-lg">
                                <option value="all">All Fees</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-indigo-600 text-white">
                                    <tr>
                                        <th className="p-3 text-left">Student</th>
                                        <th className="p-3 text-left">Class</th>
                                        <th className="p-3 text-left">Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fees.filter(f => feeFilter === 'all' || (feeFilter === 'paid' && f.paid_count > 0) || (feeFilter === 'unpaid' && f.paid_count === 0)).map((f, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{f.student_name}</td>
                                            <td className="p-3">{f.class_name}</td>
                                            <td className="p-3">₹{f.fee_amount}</td>
                                            <td className="p-3"><span className={f.paid_count > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>{f.paid_count > 0 ? 'Paid' : 'Unpaid'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {fees.length === 0 && <div className="text-center py-20"><div className="text-6xl mb-4">💰</div><p className="text-gray-400">No fee records yet</p></div>}
                    </div>
                )}

                {/* BACKUP TAB */}
                {activeTab === 'backup' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">💾</span> Data Backup & Restore
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-xl shadow-xl text-center">
                                <div className="text-6xl mb-4">⬇️</div>
                                <h3 className="font-bold text-xl mb-4">Download Backup</h3>
                                <p className="text-gray-600 mb-6">Download all your school data as a JSON file</p>
                                <button onClick={handleDownloadBackup} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">Download Backup</button>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-xl text-center">
                                <div className="text-6xl mb-4">⬆️</div>
                                <h3 className="font-bold text-xl mb-4">Restore Backup</h3>
                                <p className="text-gray-600 mb-6">⚠️ This will replace ALL current data</p>
                                <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" id="restoreFile" />
                                <label htmlFor="restoreFile" className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 cursor-pointer inline-block">Restore Backup</label>
                            </div>
                        </div>
                    </div>
                )}

                `;

const part2 = currentDashboard.substring(insertPoint);

const completeDashboard = part1 + missingTabs + part2;

fs.writeFileSync('client/src/pages/SchoolAdmin/Dashboard.jsx', completeDashboard, 'utf8');
console.log('✅ Dashboard.jsx updated with ALL tabs!');
console.log('Total lines:', completeDashboard.split('\n').length);
