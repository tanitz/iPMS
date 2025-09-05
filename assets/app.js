document.addEventListener('DOMContentLoaded', () => {
    
    // --- IMPORTANT SETUP ---
    const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxqyFFgUaNmJdr6Cje6ciss8vzCrSGtRY15a70ejac_7hDWgTBCiL5iQnLCDFwSFP1cTA/exec";

    // --- Initial HTML for Views and Modals ---
    // Dashboard
    document.getElementById('dashboard-view').innerHTML = `<h2 class="text-3xl font-bold mb-6">ภาพรวมโปรเจกต์</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-gray-500 text-sm font-medium">งานทั้งหมด</h3><p id="total-tasks" class="text-3xl font-bold">0</p></div><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-gray-500 text-sm font-medium">ยังไม่เริ่ม</h3><p id="todo-tasks" class="text-3xl font-bold text-blue-500">0</p></div><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-gray-500 text-sm font-medium">กำลังทำ</h3><p id="inprogress-tasks" class="text-3xl font-bold text-yellow-500">0</p></div><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-gray-500 text-sm font-medium">เสร็จสิ้น</h3><p id="done-tasks" class="text-3xl font-bold text-green-500">0</p></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-2 bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">สรุปสถานะงาน</h3><div id="task-chart-container"></div></div><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">งานที่ใกล้ถึงกำหนด</h3><ul id="upcoming-tasks-list" class="space-y-3"></ul></div></div>`;
    // Timeline
    document.getElementById('timeline-view').innerHTML = `<h2 class="text-3xl font-bold mb-6">ภาพรวมไทม์ไลน์ทุกโปรเจกต์</h2><div class="bg-white p-4 rounded-lg shadow overflow-x-auto"><svg id="master-gantt-chart"></svg></div>`;
    // Projects
    document.getElementById('projects-view').innerHTML = `<div class="flex justify-between items-center mb-6"><h2 class="text-3xl font-bold">โปรเจกต์ทั้งหมด</h2><button id="add-project-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">+ สร้างโปรเจกต์ใหม่</button></div><div id="project-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>`;
    // Plan
    document.getElementById('plan-view').innerHTML = `<div class="flex justify-between items-center mb-6"><div><button id="back-to-projects-btn" class="text-indigo-600 hover:underline mb-2 flex items-center"><svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>กลับไปรายการโปรเจกต์</button><h2 id="plan-view-title" class="text-3xl font-bold"></h2></div><button id="add-task-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">+ เพิ่มงานใหม่</button></div><div class="mb-6 flex space-x-8 project-view-tabs"><button data-project-view="kanban" class="project-view-btn active">Kanban</button><button data-project-view="gantt" class="project-view-btn">Gantt Chart</button><button data-project-view="list" class="project-view-btn">List</button></div><div id="kanban-container"><div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="bg-white rounded-lg shadow"><h3 class="text-lg font-bold p-4 border-b text-blue-600">งานที่ต้องทำ (To Do)</h3><div id="todo" class="p-4 space-y-4 kanban-column" data-status="todo"></div></div><div class="bg-white rounded-lg shadow"><h3 class="text-lg font-bold p-4 border-b text-yellow-600">กำลังดำเนินการ (In Progress)</h3><div id="inprogress" class="p-4 space-y-4 kanban-column" data-status="inprogress"></div></div><div class="bg-white rounded-lg shadow"><h3 class="text-lg font-bold p-4 border-b text-green-600">เสร็จสิ้น (Done)</h3><div id="done" class="p-4 space-y-4 kanban-column" data-status="done"></div></div></div></div><div id="gantt-container" class="hidden bg-white p-4 rounded-lg shadow overflow-x-auto"><svg id="gantt-chart"></svg></div><div id="list-container" class="hidden bg-white rounded-lg shadow overflow-x-auto"></div>`;
    // Team
    document.getElementById('team-view').innerHTML = `<div class="flex justify-between items-center mb-6"><h2 class="text-3xl font-bold">จัดการทีม</h2><button id="add-member-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">+ เพิ่มสมาชิก</button></div><div id="team-list" class="bg-white rounded-lg shadow overflow-hidden"></div>`;
    // Modals
    document.getElementById('project-modal').innerHTML = `<div class="modal-content"><div class="flex justify-between items-center mb-4"><h3 id="project-modal-title" class="text-2xl font-bold">สร้างโปรเจกต์ใหม่</h3><button id="close-project-modal" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button></div><form id="project-form"><input type="hidden" id="project-id"><div class="space-y-4"><div class="mb-4"><label for="project-name" class="block text-sm font-medium text-gray-700">ชื่อโปรเจกต์</label><input type="text" id="project-name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required></div><div class="mb-4"><label for="project-desc" class="block text-sm font-medium text-gray-700">คำอธิบายสั้นๆ</label><textarea id="project-desc" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea></div><div class="bg-gray-50 p-4 rounded-lg space-y-4"><div class=""><label class="block text-sm font-medium text-gray-700 mb-2">ไอคอน</label><div class="flex items-center space-x-4"><div id="project-icon-preview" class="project-icon-preview flex-shrink-0">📁</div><div class="flex-1"><label for="project-icon-upload" class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full text-center block"><span>อัปโหลดรูปภาพ</span><input id="project-icon-upload" name="icon-upload" type="file" class="sr-only" accept="image/png, image/jpeg, image/gif"></label><p class="text-xs text-gray-500 mt-1">ขนาดไม่เกิน 200KB</p></div></div></div><div><label class="block text-sm font-medium text-gray-700 mb-2">สีพื้นหลังไอคอน</label><div class="flex items-center space-x-2 mt-1 flex-wrap"><div id="color-palette" class="flex items-center space-x-2 flex-wrap"></div><label for="project-color" class="color-dot-wrapper relative"><input type="color" id="project-color" value="#60a5fa"></label></div></div></div></div><input type="hidden" id="project-icon-base64"><div class="flex items-center w-full pt-4 mt-6 border-t"><button type="button" id="delete-project-btn" class="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 hidden">ลบโปรเจกต์</button><div class="flex-grow"></div><button type="submit" id="save-project-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">บันทึก</button></div></form></div>`;
    document.getElementById('task-modal').innerHTML = `<div class="modal-content animate-fade-in-down"><div class="flex justify-between items-center mb-4"><h3 id="modal-title" class="text-2xl font-bold">เพิ่มงานใหม่</h3><button id="close-task-modal" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button></div><form id="task-form"><input type="hidden" id="task-id"><div class="mb-4"><label for="task-title" class="block text-sm font-medium text-gray-700">ชื่องาน</label><input type="text" id="task-title" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required></div><div class="mb-4"><div class="flex justify-between items-center"><label for="task-desc" class="block text-sm font-medium text-gray-700">รายละเอียด</label><button type="button" id="generate-desc-btn" class="gemini-btn">✨ ช่วยคิด</button></div><textarea id="task-desc" rows="4" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="กรอกชื่องานแล้วกด 'ช่วยคิด' เพื่อให้ AI สร้างรายละเอียด..."></textarea></div><div class="mb-4"><label for="task-assignee" class="block text-sm font-medium text-gray-700">ผู้รับผิดชอบ</label><select id="task-assignee" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></select></div><div class="grid grid-cols-2 gap-4 mb-4"><div><label for="task-start-date" class="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label><input type="date" id="task-start-date" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required></div><div><label for="task-due-date" class="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label><input type="date" id="task-due-date" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required></div></div><div class="mb-6"><label for="task-progress" class="block text-sm font-medium text-gray-700">ความคืบหน้า: <span id="progress-value">0</span>%</label><input type="range" id="task-progress" min="0" max="100" value="0" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"></div><div class="flex justify-end space-x-3"><button type="button" id="delete-task-btn" class="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 hidden">ลบ</button><button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">บันทึก</button></div></form></div>`;
    document.getElementById('member-modal').innerHTML = `<div class="modal-content"><div class="flex justify-between items-center mb-4"><h3 id="member-modal-title" class="text-2xl font-bold">เพิ่มสมาชิกใหม่</h3><button id="close-member-modal" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button></div><form id="member-form"><input type="hidden" id="member-id"><div class="mb-4"><label for="member-name" class="block text-sm font-medium text-gray-700">ชื่อ-สกุล</label><input type="text" id="member-name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required></div><div class="mb-4"><label for="member-role" class="block text-sm font-medium text-gray-700">หน้าที่</label><select id="member-role" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required><option>Project Manager</option><option>Developer</option><option>Designer</option><option>Tester</option></select></div><div class="mb-6"><label class="block text-sm font-medium text-gray-700">รูปโปรไฟล์</label><div class="mt-2 flex items-center space-x-4"><img id="avatar-preview" class="w-16 h-16 rounded-full object-cover bg-gray-200" src="https://placehold.co/100x100/CCCCCC/FFFFFF?text=?"><label for="member-avatar-upload" class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><span>อัปโหลดรูป</span><input id="member-avatar-upload" name="avatar" type="file" class="sr-only" accept="image/png, image/jpeg, image/gif"></label><input type="hidden" id="member-avatar-base64"></div><p class="text-xs text-gray-500 mt-1">แนะนำ: รูปสี่เหลี่ยมจัตุรัส, ขนาดไม่เกิน 200KB</p></div><div class="flex justify-end"><button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">บันทึก</button></div></form></div>`;
    
    // --- State Management ---
    let state = {
        users: [],
        projects: [],
        tasks: [],
        currentView: 'dashboard',
        currentProjectView: 'kanban',
        selectedProjectId: null,
        editingTaskId: null,
        editingProjectId: null,
        ganttChart: null,
        masterGanttChart: null,
    };

    const loadingOverlay = document.getElementById('loading-overlay');

    // --- Data Fetching and Updating ---
    
    async function showLoading(isFetching) {
        loadingOverlay.style.opacity = isFetching ? '1' : '0';
        loadingOverlay.style.pointerEvents = isFetching ? 'auto' : 'none';
    }
    
    async function postData(payload) {
        if (GOOGLE_SHEET_API_URL === "YOUR_DEPLOYED_WEB_APP_URL_HERE") {
            console.error("Google Sheet API URL is not set. Aborting postData.");
            return { status: 'error', message: 'API URL not configured.' };
        }
        try {
            // This is a "fire and forget" request. We don't wait for the response to keep the UI fast.
            fetch(GOOGLE_SHEET_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                redirect: 'follow',
                body: JSON.stringify(payload),
                headers: {
                  'Content-Type': 'text/plain;charset=utf-8',
                }
            });
            return { status: 'success' };
        } catch (error) {
            console.error('Error posting data:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล!');
            return { status: 'error' };
        }
    }

    function loadSampleData() {
        console.warn("Loading sample data because fetch failed.");
        state.users = [
            { id: 1, name: 'สมชาย ใจดี', role: 'Project Manager', avatar: 'https://placehold.co/100x100/4F46E5/FFFFFF?text=สช' },
            { id: 2, name: 'มานี รักเรียน', role: 'Developer', avatar: 'https://placehold.co/100x100/10B981/FFFFFF?text=มน' },
            { id: 3, name: 'ปิติ ชูใจ', role: 'Designer', avatar: 'https://placehold.co/100x100/F59E0B/FFFFFF?text=ปต' },
        ];
        state.projects = [
            { id: 1, name: 'ตัวอย่าง: Mobile Banking App', description: 'โปรเจกต์สำหรับแอป Mobile Banking', icon: '', color: '#60a5fa' },
            { id: 2, name: 'ตัวอย่าง: เว็บไซต์ E-commerce', description: 'ปรับปรุงเว็บ E-commerce', icon: '', color: '#f87171'},
        ];
        state.tasks = [
            { id: 1, projectId: 1, title: 'ออกแบบ UI/UX', assigneeId: 3, status: 'done', startDate: '2025-09-01', dueDate: '2025-09-10', sortIndex: 0, progress: 100 },
            { id: 2, projectId: 1, title: 'พัฒนาระบบ Login', assigneeId: 2, status: 'inprogress', startDate: '2025-09-11', dueDate: '2025-09-20', sortIndex: 1, progress: 50 },
            { id: 3, projectId: 2, title: 'วางแผน Sprint', assigneeId: 1, status: 'todo', startDate: '2025-09-05', dueDate: '2025-09-08', sortIndex: 0, progress: 0 },
        ];
    }

    function parseData(data) {
        state.projects = (data.projects || []).map(p => ({...p, id: Number(p.id)}));
        state.tasks = (data.tasks || []).map(t => ({
            ...t,
            id: Number(t.id),
            projectId: Number(t.projectId),
            assigneeId: t.assigneeId ? Number(t.assigneeId) : null,
            sortIndex: t.sortIndex === undefined ? null : Number(t.sortIndex),
            progress: t.progress === undefined ? 0 : Number(t.progress)
        }));
        state.users = (data.users || []).map(u => ({...u, id: Number(u.id)}));
        
        const tasksByProject = {};
        state.tasks.forEach(task => {
            if (!tasksByProject[task.projectId]) {
                tasksByProject[task.projectId] = [];
            }
            tasksByProject[task.projectId].push(task);
        });

        Object.values(tasksByProject).forEach(projectTasks => {
            projectTasks.sort((a,b) => a.id - b.id);
            projectTasks.forEach((task, index) => {
                if (task.sortIndex === undefined || task.sortIndex === null) {
                    task.sortIndex = index;
                }
            });
        });
    }
    
    async function initializeApp() {
        await showLoading(true);
        if (GOOGLE_SHEET_API_URL === "YOUR_DEPLOYED_WEB_APP_URL_HERE" || !GOOGLE_SHEET_API_URL.includes("/exec")) {
             console.warn("Google Sheet API URL is not configured correctly. Loading sample data.");
             alert("กรุณาใส่ URL ของ Google Apps Script Web App (เวอร์ชัน /exec) ที่ถูกต้อง (ตอนนี้จะแสดงข้อมูลตัวอย่างแทน)");
             loadSampleData();
             switchView('dashboard', false); // Initial load without re-fetching
             await showLoading(false);
             return;
        }

        try {
            const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getAllData`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            parseData(data);
        } catch (error) {
            console.error("Error fetching initial data:", error);
            alert("ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้ กำลังแสดงข้อมูลตัวอย่างแทน กรุณาตรวจสอบ Console (F12) สำหรับรายละเอียด");
            console.error("Please check the following:\n1. The Google Apps Script is deployed with 'Who has access' set to 'Anyone'.\n2. The URL in the GOOGLE_SHEET_API_URL variable is correct.");
            loadSampleData();
        } finally {
            switchView('dashboard', false); // Initial load without re-fetching
            await showLoading(false);
        }
    }

    // --- Helper Functions ---
    const getNewId = (array) => (array.length > 0 ? Math.max(...array.map(item => Number(item.id))) + 1 : 1);
    const getUserById = (id) => state.users.find(u => u.id === id);
    const getTaskById = (id) => state.tasks.find(t => t.id === id);
    const getProjectById = (id) => state.projects.find(p => p.id === id);
    const formatDateForInput = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    function getContrastColor(hexcolor){
        if (!hexcolor) return '#000000';
        hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? '#000000' : '#FFFFFF';
    }

    // Compute duration-weighted progress for a set of tasks.
    // Each task is weighted by its duration in days (inclusive). If dates are missing or invalid,
    // the task defaults to duration = 1 day. If total duration ends up 0, fall back to simple average.
    function computeWeightedProgress(projectTasks) {
        if (!Array.isArray(projectTasks) || projectTasks.length === 0) return 0;

        let totalWeighted = 0;
        let totalDuration = 0;

        projectTasks.forEach(task => {
            const start = task.startDate ? new Date(task.startDate) : null;
            const end = task.dueDate ? new Date(task.dueDate) : null;
            let duration = 1;
            if (start && end && !isNaN(start) && !isNaN(end)) {
                duration = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
                if (duration <= 0) duration = 1;
            }

            const prog = Number(task.progress) || 0;
            totalWeighted += prog * duration;
            totalDuration += duration;
        });

        if (totalDuration === 0) {
            // fallback to simple average
            const totalProg = projectTasks.reduce((s, t) => s + (Number(t.progress) || 0), 0);
            return projectTasks.length > 0 ? (totalProg / projectTasks.length) : 0;
        }

        return totalWeighted / totalDuration;
    }
    
    // --- Gemini API Function ---
    async function generateTaskDescription(taskTitle) {
        const apiKey = ""; // Leave as-is
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const systemPrompt = "You are an expert project manager. Your task is to write a clear, concise, and actionable task description in Thai based on the provided task title. The description should be suitable for a project management tool. Do not add any formatting like markdown headers or bullet points, just plain text.";
        const userQuery = `Task Title: "${taskTitle}"`;
        const payload = { contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) return candidate.content.parts[0].text.trim();
            return "ไม่สามารถสร้างรายละเอียดได้ โปรดลองอีกครั้ง";
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";
        }
    }

    // --- RENDER FUNCTIONS ---
    function renderAll() {
        const currentScroll = { x: window.scrollX, y: window.scrollY };
        switch(state.currentView) {
            case 'dashboard': renderDashboardView(); break;
            case 'timeline': renderTimelineView(); break;
            case 'projects': renderProjectsView(); break;
            case 'plan': renderPlanView(); break;
            case 'team': renderTeamView(); break;
        }
        updateAssigneeOptions();
        window.scrollTo(currentScroll.x, currentScroll.y);
    }
    
    function renderDashboardView() {
        const totalTasks = state.tasks.length;
        const todoTasks = state.tasks.filter(t => t.status === 'todo').length;
        const inprogressTasks = state.tasks.filter(t => t.status === 'inprogress').length;
        const doneTasks = state.tasks.filter(t => t.status === 'done').length;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('todo-tasks').textContent = todoTasks;
        document.getElementById('inprogress-tasks').textContent = inprogressTasks;
        document.getElementById('done-tasks').textContent = doneTasks;

    // Overall weighted progress across all tasks (weight by each task's duration)
    const overallWeighted = computeWeightedProgress(state.tasks) || 0;
    const overallRounded = Math.round(overallWeighted);
        
        const chartContainer = document.getElementById('task-chart-container');
        const chartData = [
            { label: 'ยังไม่เริ่ม', value: todoTasks, color: '#3b82f6' },
            { label: 'กำลังทำ', value: inprogressTasks, color: '#f59e0b' },
            { label: 'เสร็จสิ้น', value: doneTasks, color: '#10b981' },
        ];
        
        // Use the duration-weighted percent in the summary area (no separate labeled block)
        // Use the duration-weighted percent in the summary area (no separate labeled block)
        // Parent uses consistent gaps; each item has fixed width to maintain equal spacing
        let chartHTML = `
            <div class="flex flex-wrap gap-6 items-center justify-center md:justify-between">`;
        chartData.forEach(item => {
            const percentage = totalTasks > 0 ? ((item.value / totalTasks) * 100).toFixed(1) : 0;
            chartHTML += `
                <div class="text-center" style="flex: 0 0 140px; max-width:140px;">
                    <div style="width:96px; height:96px; margin:0 auto; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:700; background: conic-gradient(${item.color} ${percentage}%, #e5e7eb 0)">
                       <span class="bg-white" style="width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center">${percentage}%</span>
                    </div>
                    <p class="mt-2 text-sm font-medium">${item.label} (${item.value})</p>
                </div>`;
        });
        chartHTML += '</div>';
        chartContainer.innerHTML = chartHTML;

        const upcomingList = document.getElementById('upcoming-tasks-list');
        const today = new Date();
        today.setHours(0,0,0,0);
        const next7days = new Date(today);
        next7days.setDate(today.getDate() + 7);
        const upcomingTasks = state.tasks.filter(task => { const dueDate = new Date(task.dueDate); return task.status !== 'done' && dueDate >= today && dueDate <= next7days; }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        if (upcomingTasks.length === 0) {
            upcomingList.innerHTML = `<li class="text-gray-500 text-center py-4">ไม่มีงานที่ใกล้ถึงกำหนด</li>`;
        } else {
            upcomingList.innerHTML = upcomingTasks.map(task => {
                const user = getUserById(task.assigneeId);
                const dueDate = new Date(task.dueDate);
                const isOverdue = dueDate < today && task.status !== 'done';
                return `<li class="flex items-center justify-between"><div><p class="font-semibold">${task.title}</p><p class="text-sm text-gray-500">${user ? user.name : 'ยังไม่ระบุ'} - <span class="${isOverdue ? 'text-red-500 font-bold' : ''}">${dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span></p></div><div class="w-4 h-4 rounded-full ${task.status === 'todo' ? 'bg-blue-500' : 'bg-yellow-500'}"></div></li>`;
            }).join('');
        }
    }
    
    function highlightGanttDays(gantt) {
        if (!gantt || !gantt.gantt) return;
        
        setTimeout(() => {
            const gridEl = gantt.gantt.querySelector('.grid');
            const headerEl = gantt.gantt.querySelector('.grid-header');
            if (!gridEl || !headerEl) return;

            gridEl.querySelectorAll('.grid-sunday-highlight').forEach(el => el.remove());
            headerEl.querySelectorAll('.day-name-label').forEach(el => el.remove());
            
            const viewMode = gantt.options.view_mode;
            if (viewMode !== 'Day' && viewMode !== 'Week' && viewMode !== 'Half Day' && viewMode !== 'Quarter Day') {
                return;
            }

            const columnWidth = gantt.options.column_width;
            const thDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

            gantt.dates.forEach((date, i) => {
                const isSunday = date.getDay() === 0;

                if (isSunday) {
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', i * columnWidth);
                    rect.setAttribute('y', 0);
                    rect.setAttribute('width', columnWidth);
                    rect.setAttribute('height', '100%');
                    rect.setAttribute('class', 'grid-sunday-highlight');
                    gridEl.insertBefore(rect, gridEl.firstChild);
                }

                const dayName = thDays[date.getDay()];
                const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textEl.textContent = dayName;
                textEl.setAttribute('x', (i * columnWidth) + (columnWidth / 2));
                textEl.setAttribute('y', gantt.options.header_height - 25);
                textEl.setAttribute('text-anchor', 'middle');
                textEl.setAttribute('class', `day-name-label ${isSunday ? 'day-name-label-sunday' : ''}`);
                headerEl.appendChild(textEl);
                
                const lowerTextElements = headerEl.querySelectorAll('.lower-header .lower-text');
                const dateTextElement = lowerTextElements[i];
                 if (dateTextElement) {
                    if (isSunday) {
                        dateTextElement.classList.add('day-name-label-sunday');
                    } else {
                        dateTextElement.classList.remove('day-name-label-sunday');
                    }
                 }
            });
        }, 100);
    }
    
    function updateGanttProjectStyles() {
        let styleRules = '';
        state.projects.forEach(project => {
            const projectClass = `project-color-${project.id}`;
            styleRules += `.gantt .bar-wrapper.${projectClass} .bar { fill: ${project.color || '#a3a3a3'} !important; }`;
            styleRules += `.gantt .bar-wrapper.${projectClass} .bar-progress { fill: ${project.color ? getContrastColor(project.color) === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.2)'} !important; }`;
        });
        document.getElementById('project-gantt-styles').innerHTML = styleRules;
    }
    
    function renderTimelineView() {
        const ganttContainer = document.getElementById('master-gantt-chart');
        ganttContainer.innerHTML = '';
        
        updateGanttProjectStyles();

        const ganttProjects = state.projects.map(project => {
            const projectTasks = state.tasks.filter(t => t.projectId === project.id);
            if (projectTasks.length === 0) return null;

            const startDates = projectTasks.map(t => new Date(t.startDate));
            const dueDates = projectTasks.map(t => new Date(t.dueDate));
            const minStartDate = new Date(Math.min.apply(null, startDates));
            const maxDueDate = new Date(Math.max.apply(null, dueDates));
            
            const progress = computeWeightedProgress(projectTasks);
            
            return {
                id: `proj_${project.id}`,
                name: project.name,
                start: formatDateForInput(minStartDate),
                end: formatDateForInput(maxDueDate),
                progress: progress.toFixed(0),
                custom_class: `project-color-${project.id}`
            };
        }).filter(p => p !== null);


        if (ganttProjects.length === 0) {
            ganttContainer.innerHTML = '<p class="text-gray-500 text-center p-8">ไม่มีข้อมูลโปรเจกต์สำหรับแสดงผล</p>';
            return;
        }

        state.masterGanttChart = new Gantt("#master-gantt-chart", ganttProjects, {
             header_height: 65,
             bar_height: 30,
             padding: 20,
             view_mode: 'Month',
             on_click: function (project) {
                const projectId = parseInt(project.id.replace('proj_', ''));
                state.selectedProjectId = projectId;
                switchView('plan');
            },
            on_view_change: function(mode) {
                highlightGanttDays(state.masterGanttChart);
                renderGanttIcons(state.masterGanttChart, "#master-gantt-chart");
            }
        });
        
        renderGanttIcons(state.masterGanttChart, "#master-gantt-chart");
        highlightGanttDays(state.masterGanttChart);
    }
    
    function renderGanttIcons(gantt, selector) {
        setTimeout(() => {
            const labels = document.querySelectorAll(`${selector} .list-row-label`);
            labels.forEach(label => {
                const existingIcon = label.querySelector('.gantt-icon');
                if (existingIcon) existingIcon.remove();

                const row = label.closest('.list-row');
                if(!row) return;

                const projectId = Number(row.dataset.id.replace('proj_',''));
                const project = getProjectById(projectId);

                if(project) {
                    label.classList.add('flex', 'items-center');
                    let iconContent = project.name ? project.name.charAt(0) : '?';
                    if (project.icon && project.icon.startsWith('data:image')) {
                        iconContent = `<img src="${project.icon}" class="w-full h-full object-cover rounded-full">`;
                    } else {
                        const textColor = getContrastColor(project.color);
                        iconContent = `<span style="color: ${textColor}">${iconContent}</span>`;
                    }

                    const iconEl = document.createElement('div');
                    iconEl.className = 'gantt-icon w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0';
                    iconEl.style.backgroundColor = project.color || '#a3a3a3';
                    iconEl.innerHTML = iconContent;

                    label.insertBefore(iconEl, label.firstChild);
                }
            });
        }, 150);
    }


    function renderProjectsView() {
        const projectList = document.getElementById('project-list');
        projectList.innerHTML = '';
        if (state.projects.length === 0) {
            projectList.innerHTML = `<p class="text-gray-500 col-span-3 text-center">ยังไม่มีโปรเจกต์ ลองสร้างโปรเจกต์แรกของคุณ!</p>`;
            return;
        }
        state.projects.forEach(project => {
            const projectTasks = state.tasks.filter(t => t.projectId === project.id);
            const totalTasks = projectTasks.length;
            const progress = totalTasks > 0 ? computeWeightedProgress(projectTasks).toFixed(0) : 0;
            const card = document.createElement('div');
            const bgColor = project.color || '#e0e7ff';
            const textColor = getContrastColor(bgColor);
            
            let iconContent = project.name ? project.name.charAt(0) : '📁';
            if (project.icon && project.icon.startsWith('data:image')) {
                iconContent = `<img src="${project.icon}" class="w-full h-full object-cover">`;
            }

            const upcomingTasks = projectTasks
                .filter(t => t.status !== 'done' && t.dueDate)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            const nextDueDate = upcomingTasks.length > 0 ? new Date(upcomingTasks[0].dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-';
            const lastUpdatedTask = projectTasks.length > 0 ? projectTasks.sort((a, b) => b.id - a.id)[0].title : '-';


            card.className = 'project-card bg-white p-6 rounded-lg shadow relative';
            card.innerHTML = `
                <div class="absolute top-3 right-3 flex space-x-1 z-10">
                    <button data-project-id="${project.id}" class="edit-project-btn p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 rounded-full focus:outline-none">
                        <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                    </button>
                </div>
                <div data-project-id="${project.id}" class="project-card-body cursor-pointer">
                    <div class="flex items-center mb-4">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl mr-3 overflow-hidden" style="background-color: ${bgColor}; color: ${textColor};">
                            ${iconContent}
                        </div>
                        <h3 class="font-bold text-xl text-gray-800">${project.name}</h3>
                    </div>
                    <p class="text-gray-600 mb-4 h-12 overflow-hidden">${project.description}</p>
                    <div class="space-y-3 text-sm text-gray-500 border-t pt-3 mt-3">
                         <div class="flex justify-between"><span>งานล่าสุด:</span> <span class="font-medium text-gray-700 truncate w-1/2 text-right">${lastUpdatedTask}</span></div>
                         <div class="flex justify-between"><span>กำหนดส่งถัดไป:</span> <span class="font-medium text-gray-700">${nextDueDate}</span></div>
                    </div>
                    <div class="mt-4">
                        <div class="flex justify-between text-sm text-gray-500 mb-1">
                            <span>ความคืบหน้า</span>
                            <span class="font-semibold">${progress}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
            projectList.appendChild(card);
        });
    }

    function renderPlanView() {
        if (!state.selectedProjectId) { switchView('projects'); return; }
        const project = getProjectById(state.selectedProjectId);
        if (!project) {
             console.error("Could not find project with ID:", state.selectedProjectId);
             alert("ไม่พบโปรเจกต์ที่เลือก");
             switchView('projects');
             return;
        }
        document.getElementById('plan-view-title').textContent = project.name;
        
        document.getElementById('kanban-container').classList.add('hidden');
        document.getElementById('gantt-container').classList.add('hidden');
        document.getElementById('list-container').classList.add('hidden');

        switch(state.currentProjectView) {
            case 'kanban':
                document.getElementById('kanban-container').classList.remove('hidden');
                renderKanbanBoard();
                break;
            case 'gantt':
                document.getElementById('gantt-container').classList.remove('hidden');
                renderGanttChart();
                break;
            case 'list':
                document.getElementById('list-container').classList.remove('hidden');
                renderListView();
                break;
        }
    }

    function renderKanbanBoard() {
        const tasksForProject = state.tasks.filter(task => task.projectId === state.selectedProjectId);
        const columns = { todo: document.getElementById('todo'), inprogress: document.getElementById('inprogress'), done: document.getElementById('done') };
        Object.values(columns).forEach(col => col.innerHTML = '');
        tasksForProject.forEach(task => {
            const user = getUserById(task.assigneeId);
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card bg-gray-50 p-4 rounded-lg border shadow-sm';
            taskCard.setAttribute('draggable', true);
            taskCard.dataset.taskId = task.id;
            const dueDate = new Date(task.dueDate);
            const today = new Date(); today.setHours(0,0,0,0);
            const isOverdue = dueDate < today && task.status !== 'done';
            taskCard.innerHTML = `<h4 class="font-bold">${task.title}</h4><div class="w-full bg-gray-200 rounded-full h-1.5 my-2"><div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${task.progress || 0}%"></div></div><div class="flex justify-between items-center text-sm mt-3"><span class="px-2 py-1 rounded-full text-xs font-semibold ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}">${isOverdue ? 'เลยกำหนด' : ''} ${dueDate.toLocaleDateString('th-TH')}</span>${user ? `<img src="${user.avatar}" class="w-8 h-8 rounded-full" title="${user.name}">` : `<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs" title="ยังไม่ระบุ">?</div>`}</div>`;
            taskCard.addEventListener('click', () => openTaskModal(task.id));
            columns[task.status].appendChild(taskCard);
        });
        setupDragAndDrop();
    }

    function renderGanttChart() {
        const ganttContainer = document.getElementById('gantt-chart');
        ganttContainer.innerHTML = ''; 
        const tasksForProject = state.tasks.filter(task => task.projectId === state.selectedProjectId);
        
        if (tasksForProject.length === 0) {
            ganttContainer.innerHTML = '<p class="text-gray-500 text-center p-8">ไม่มีงานในโปรเจกต์นี้</p>';
            return;
        }

        const ganttTasks = tasksForProject.map(task => ({
            id: String(task.id),
            name: task.title,
            start: task.startDate,
            end: task.dueDate,
            progress: task.progress || 0,
            custom_class: 'bar-' + task.status,
        }));

        state.ganttChart = new Gantt("#gantt-chart", ganttTasks, {
            header_height: 65,
            on_date_change: (task, start, end) => handleGanttDateChange(task, start, end),
            on_progress_change: (task, progress) => handleGanttProgressChange(task, progress),
            on_click: (task) => openTaskModal(parseInt(task.id)),
            on_view_change: function(mode) {
                highlightGanttDays(state.ganttChart);
            }
        });
        highlightGanttDays(state.ganttChart);
    }
    
    function renderListView() {
        const listContainer = document.getElementById('list-container');
        listContainer.innerHTML = ''; 
        const tasksForProject = state.tasks.filter(task => task.projectId === state.selectedProjectId);
        
        tasksForProject.sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0));

        if (tasksForProject.length === 0) {
            listContainer.innerHTML = '<p class="text-gray-500 text-center p-8">ไม่มีงานในโปรเจกต์นี้</p>';
            return;
        }

        let tableHTML = `
            <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-600">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" class="px-4 py-3">#</th>
                        <th scope="col" class="px-6 py-3">ชื่องาน</th>
                        <th scope="col" class="px-6 py-3">ผู้รับผิดชอบ</th>
                        <th scope="col" class="px-6 py-3">วันที่เริ่ม</th>
                        <th scope="col" class="px-6 py-3">วันที่สิ้นสุด</th>
                        <th scope="col" class="px-6 py-3 text-center">ระยะเวลา</th>
                        <th scope="col" class="px-6 py-3">ความคืบหน้า</th>
                        <th scope="col" class="px-6 py-3 text-center">แก้ไข</th>
                    </tr>
                </thead>
                <tbody>
        `;

        tasksForProject.forEach((task, index) => {
            const user = getUserById(task.assigneeId);
            const startDate = new Date(task.startDate);
            const dueDate = new Date(task.dueDate);
            const duration = Math.ceil(Math.abs(dueDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const progress = task.progress || 0;
            
            tableHTML += `
                <tr class="bg-white border-b hover:bg-gray-50 task-row" draggable="true" data-task-id="${task.id}">
                    <td class="px-4 py-4 font-medium text-gray-900">${index + 1}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">${task.title}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-2">
                           ${user ? `<img src="${user.avatar}" class="w-7 h-7 rounded-full" title="${user.name}"> <span>${user.name}</span>` : `<span>ยังไม่ระบุ</span>`}
                        </div>
                    </td>
                    <td class="px-6 py-4">${startDate.toLocaleDateString('th-TH')}</td>
                    <td class="px-6 py-4">${dueDate.toLocaleDateString('th-TH')}</td>
                    <td class="px-6 py-4 text-center">${duration} วัน</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                            </div>
                            <span class="text-xs font-medium">${progress}%</span>
                        </div>
                    </td>
                     <td class="px-6 py-4 text-center">
                        <button data-task-id="${task.id}" class="edit-task-btn text-indigo-600 hover:text-indigo-900 font-medium p-1">
                          <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table></div>`;
        listContainer.innerHTML = tableHTML;
        
        setupListViewInteractions();
    }

    function renderTeamView() {
        const teamList = document.getElementById('team-list');
        teamList.innerHTML = '';
        state.users.forEach(user => {
            const tasksCount = state.tasks.filter(task => task.assigneeId === user.id).length;
            const userElement = document.createElement('div');
            userElement.className = 'flex items-center justify-between p-4 border-b last:border-b-0';
            userElement.innerHTML = `
                <div class="flex items-center">
                    <img src="${user.avatar}" class="w-12 h-12 rounded-full mr-4 object-cover" onerror="this.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=??'; this.onerror=null;">
                    <div>
                        <p class="font-bold text-lg">${user.name}</p>
                        <p class="text-gray-500">${user.role}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                     <div>
                        <span class="text-gray-600 font-medium">งานที่รับผิดชอบ: </span>
                        <span class="text-indigo-600 font-bold text-lg">${tasksCount}</span>
                    </div>
                    <button data-user-id="${user.id}" class="edit-member-btn text-gray-400 hover:text-indigo-600 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                    </button>
                </div>
            `;
            teamList.appendChild(userElement);
        });
    }

    function updateAssigneeOptions() {
        const assigneeSelect = document.getElementById('task-assignee');
        assigneeSelect.innerHTML = '<option value="">-- ไม่ระบุ --</option>';
        state.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            assigneeSelect.appendChild(option);
        });
    }

    // --- VIEW SWITCHING ---
    async function switchView(viewName, fetchData = true) {
        if (state.currentView === viewName && !fetchData) {
             renderAll();
             return;
        }; 

        state.currentView = viewName;
        document.querySelectorAll('.app-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(`${viewName}-view`).classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewName);
        });

        if (fetchData) {
            await refreshDataAndRender();
        } else {
            renderAll();
        }
    }
    
    function switchProjectView(projectViewName) {
        state.currentProjectView = projectViewName;
        document.querySelectorAll('.project-view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.projectView === projectViewName);
        });
        renderPlanView();
    }

    async function refreshDataAndRender() {
        await showLoading(true);
        try {
            const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getAllData`);
            if (!response.ok) throw new Error(`Network response was not ok`);
            const data = await response.json();
            parseData(data);
        } catch (error) {
            console.error("Error refreshing data:", error);
            alert("ไม่สามารถรีเฟรชข้อมูลได้ กำลังแสดงข้อมูลเดิม");
        } finally {
            renderAll();
            await showLoading(false);
        }
    }
    
    // --- MODAL LOGIC & EVENT HANDLERS ---
    let confirmCallback = null;
    const confirmModal = document.getElementById('confirm-modal');

    function openConfirmModal(title, text, onConfirm) {
        document.getElementById('confirm-modal-title').textContent = title;
        document.getElementById('confirm-modal-text').textContent = text;
        confirmCallback = onConfirm;
        confirmModal.style.display = 'block';
    }

    function closeConfirmModal() {
        confirmModal.style.display = 'none';
        confirmCallback = null;
    }

    function openProjectModal(projectId = null) {
        document.getElementById('project-form').reset();
        state.editingProjectId = projectId;
        const modalTitle = document.getElementById('project-modal-title');
        const deleteBtn = document.getElementById('delete-project-btn');
        const saveBtn = document.getElementById('save-project-btn');
        const projectIdInput = document.getElementById('project-id');
        const colorInput = document.getElementById('project-color');
        const iconBase64Input = document.getElementById('project-icon-base64');
        const iconPreview = document.getElementById('project-icon-preview');
        const iconUploadInput = document.getElementById('project-icon-upload');

        // Reset fields
        iconUploadInput.value = null; 
        iconBase64Input.value = '';

        if (projectId) {
            modalTitle.textContent = 'แก้ไขโปรเจกต์';
            const project = getProjectById(projectId);
            if (project) {
                projectIdInput.value = project.id;
                document.getElementById('project-name').value = project.name;
                document.getElementById('project-desc').value = project.description;
                colorInput.value = project.color || '#60a5fa';
                
                if (project.icon && project.icon.startsWith('data:image')) {
                    iconPreview.innerHTML = `<img src="${project.icon}" class="w-full h-full object-cover rounded-xl">`;
                    iconBase64Input.value = project.icon;
                } else {
                    iconPreview.innerHTML = '📁'; // Default icon
                }
            }
            deleteBtn.classList.remove('hidden');
            saveBtn.textContent = 'อัปเดตโปรเจกต์';
        } else {
            modalTitle.textContent = 'สร้างโปรเจกต์ใหม่';
            projectIdInput.value = '';
            colorInput.value = '#60a5fa';
            iconPreview.innerHTML = '📁';
            deleteBtn.classList.add('hidden');
            saveBtn.textContent = 'บันทึกโปรเจกต์';
        }
        setupColorPalette(colorInput.value);
        projectModal.style.display = 'block';
    }

    function closeProjectModal() { 
        projectModal.style.display = 'none'; 
        state.editingProjectId = null;
    }

    function openTaskModal(taskId = null) {
        document.getElementById('task-form').reset();
        state.editingTaskId = taskId;
        const modalTitle = document.getElementById('modal-title');
        const deleteBtn = document.getElementById('delete-task-btn');
        const progressSlider = document.getElementById('task-progress');
        const progressValue = document.getElementById('progress-value');
        
        if (taskId) {
            modalTitle.textContent = 'แก้ไขงาน';
            deleteBtn.classList.remove('hidden');
            const task = getTaskById(taskId);
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.description;
            document.getElementById('task-assignee').value = task.assigneeId;
            document.getElementById('task-start-date').value = formatDateForInput(task.startDate);
            document.getElementById('task-due-date').value = formatDateForInput(task.dueDate);
            progressSlider.value = task.progress || 0;
            progressValue.textContent = task.progress || 0;
        } else {
            modalTitle.textContent = 'เพิ่มงานใหม่';
            deleteBtn.classList.add('hidden');
            progressSlider.value = 0;
            progressValue.textContent = 0;
        }
        taskModal.style.display = 'block';
    }
    function closeTaskModal() { taskModal.style.display = 'none'; state.editingTaskId = null; }
    
    function openMemberModal(userId = null) {
        const form = document.getElementById('member-form');
        form.reset();
        const modalTitle = document.getElementById('member-modal-title');
        const memberIdInput = document.getElementById('member-id');
        const avatarPreview = document.getElementById('avatar-preview');
        const avatarBase64Input = document.getElementById('member-avatar-base64');
        const avatarUploadInput = document.getElementById('member-avatar-upload');

        avatarUploadInput.value = null; // Clear the file input

        if (userId) {
            modalTitle.textContent = 'แก้ไขข้อมูลสมาชิก';
            const user = state.users.find(u => u.id === userId);
            if (user) {
                memberIdInput.value = user.id;
                document.getElementById('member-name').value = user.name;
                document.getElementById('member-role').value = user.role;
                avatarPreview.src = user.avatar;
                avatarBase64Input.value = user.avatar;
            }
        } else {
            modalTitle.textContent = 'เพิ่มสมาชิกใหม่';
            memberIdInput.value = '';
            avatarPreview.src = 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=?';
            avatarBase64Input.value = '';
        }
        memberModal.style.display = 'block';
    }

    function closeMemberModal() { memberModal.style.display = 'none'; }

    async function handleGanttDateChange(task, start, end) {
        const taskId = parseInt(task.id);
        const taskToUpdate = getTaskById(taskId);
        if (taskToUpdate) {
            const endDate = new Date(end);
            endDate.setDate(endDate.getDate() - 1);
            
            taskToUpdate.startDate = formatDateForInput(start);
            taskToUpdate.dueDate = formatDateForInput(endDate);
            
            renderAll();
            await postData({ action: 'updateTask', data: taskToUpdate });
        }
    }

    async function handleGanttProgressChange(ganttTask, progress) {
        const taskId = parseInt(ganttTask.id);
        const taskToUpdate = getTaskById(taskId);
        if (taskToUpdate) {
            const newProgress = Math.round(progress);
            if (taskToUpdate.progress !== newProgress) {
                taskToUpdate.progress = newProgress;
                taskToUpdate.status = newProgress >= 100 ? 'done' : (newProgress > 0 ? 'inprogress' : 'todo');
                renderAll(); // Re-render to reflect changes everywhere
                await postData({ action: 'updateTask', data: taskToUpdate });
            }
        }
    }

    let draggedKanbanItem = null;
    function setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.kanban-column');
        taskCards.forEach(card => {
            card.addEventListener('dragstart', () => { draggedKanbanItem = card; setTimeout(() => card.classList.add('dragging'), 0); });
            card.addEventListener('dragend', () => { draggedKanbanItem.classList.remove('dragging'); draggedKanbanItem = null; });
        });
        columns.forEach(column => {
            column.addEventListener('dragover', e => e.preventDefault());
            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                if (draggedKanbanItem) {
                    const taskId = parseInt(draggedKanbanItem.dataset.taskId);
                    const newStatus = column.dataset.status;
                    const task = getTaskById(taskId);
                    if (task && task.status !== newStatus) {
                        task.status = newStatus;
                        // Auto-update progress based on status change
                        if (newStatus === 'done') {
                            task.progress = 100;
                        } else if (newStatus === 'todo') {
                            task.progress = 0;
                        } else if (newStatus === 'inprogress' && task.progress === 0) {
                            task.progress = 10; // Default progress for starting a task
                        }
                        
                        renderAll();
                        await postData({ action: 'updateTask', data: task });
                    }
                }
            });
        });
    }

    function setupListViewInteractions() {
        const listContainer = document.getElementById('list-container');
        if (!listContainer) return;

        // --- CLICK EVENT for EDIT BUTTON ---
        listContainer.addEventListener('click', e => {
            const editButton = e.target.closest('.edit-task-btn');
            if (editButton) {
                e.stopPropagation(); 
                const taskId = Number(editButton.dataset.taskId);
                openTaskModal(taskId);
            }
        });
        
        // --- DRAG AND DROP LOGIC ---
        const tableBody = listContainer.querySelector('tbody');
        if (!tableBody) return;
        
        let draggedItem = null;

        tableBody.addEventListener('dragstart', e => {
            if (e.target.classList.contains('task-row')) {
                draggedItem = e.target;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', draggedItem.innerHTML);
                setTimeout(() => {
                    draggedItem.classList.add('dragging');
                }, 0);
            }
        });

        tableBody.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
            }
            draggedItem = null;
            document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });
        });

        tableBody.addEventListener('dragover', e => {
            e.preventDefault();
            const targetRow = e.target.closest('tr');
            if (targetRow && targetRow !== draggedItem) {
                document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
                    el.classList.remove('drag-over-top', 'drag-over-bottom');
                });
                
                const rect = targetRow.getBoundingClientRect();
                const offset = e.clientY - rect.top - (rect.height / 2);

                if (offset < 0) {
                    targetRow.classList.add('drag-over-top');
                } else {
                    targetRow.classList.add('drag-over-bottom');
                }
            }
        });

        tableBody.addEventListener('dragleave', e => {
             const targetRow = e.target.closest('tr');
             if (targetRow) {
                 targetRow.classList.remove('drag-over-top', 'drag-over-bottom');
             }
        });

        tableBody.addEventListener('drop', async e => {
            e.preventDefault();
            document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            const targetRow = e.target.closest('tr');
            if (draggedItem && targetRow && targetRow !== draggedItem) {
                const rect = targetRow.getBoundingClientRect();
                const offset = e.clientY - rect.top - (rect.height / 2);
                if (offset < 0) {
                    tableBody.insertBefore(draggedItem, targetRow);
                } else {
                    tableBody.insertBefore(draggedItem, targetRow.nextSibling);
                }
            } else if (draggedItem) {
                tableBody.appendChild(draggedItem);
            }
            
            const updatedRows = [...tableBody.querySelectorAll('tr')];
            const updates = [];
            updatedRows.forEach((row, newIndex) => {
                const taskId = Number(row.dataset.taskId);
                const task = getTaskById(taskId);
                if (task && task.sortIndex !== newIndex) {
                    task.sortIndex = newIndex;
                    updates.push(task);
                }
            });

            if (updates.length > 0) {
                renderListView(); 
                for (const task of updates) {
                    await postData({ action: 'updateTask', data: task });
                }
            }
        });
    }

    function setupColorPalette(initialColor) {
        const paletteContainer = document.getElementById('color-palette');
        const colorInput = document.getElementById('project-color');
        const colorInputWrapper = colorInput.closest('.color-dot-wrapper');
        const colors = ['#f87171', '#facc15', '#4ade80', '#60a5fa']; // red, yellow, green, blue
        
        paletteContainer.innerHTML = '';
        let initialColorIsFromPalette = false;

        colors.forEach(color => {
            const dot = document.createElement('div');
            dot.className = 'color-dot';
            dot.style.backgroundColor = color;
            dot.dataset.color = color;
            if (color === initialColor) {
                dot.classList.add('selected');
                initialColorIsFromPalette = true;
            }
            paletteContainer.appendChild(dot);
        });
        
        if (!initialColorIsFromPalette && initialColor) {
             colorInputWrapper.classList.add('selected');
        } else {
             colorInputWrapper.classList.remove('selected');
        }

        paletteContainer.addEventListener('click', e => {
            const target = e.target;
            if (target.classList.contains('color-dot')) {
                const color = target.dataset.color;
                colorInput.value = color;
                paletteContainer.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
                target.classList.add('selected');
                colorInputWrapper.classList.remove('selected');
            }
        });

        colorInput.addEventListener('input', () => {
            paletteContainer.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
            colorInputWrapper.classList.add('selected');
        });
    }


    // --- INITIAL SETUP & EVENT LISTENERS ---
    const mainNav = document.getElementById('main-nav');
    const projectModal = document.getElementById('project-modal');
    const taskModal = document.getElementById('task-modal');
    const memberModal = document.getElementById('member-modal');
    const taskProgressSlider = document.getElementById('task-progress');
    const progressValueSpan = document.getElementById('progress-value');

    if(taskProgressSlider && progressValueSpan) {
        taskProgressSlider.addEventListener('input', (e) => {
            progressValueSpan.textContent = e.target.value;
        });
    }

    document.querySelectorAll('.project-view-btn').forEach(btn => btn.addEventListener('click', () => switchProjectView(btn.dataset.projectView)));
    mainNav.addEventListener('click', (e) => { const link = e.target.closest('.nav-link'); if (link) { e.preventDefault(); switchView(link.dataset.view); } });
    document.getElementById('add-project-btn').addEventListener('click', () => openProjectModal());
    document.getElementById('close-project-modal').addEventListener('click', closeProjectModal);
    document.getElementById('project-form').addEventListener('submit', handleProjectFormSubmit);
    document.getElementById('delete-project-btn').addEventListener('click', handleDeleteProject);
    document.getElementById('project-icon-upload').addEventListener('change', handleProjectIconUpload);
    

    document.getElementById('project-list').addEventListener('click', e => {
        const editBtn = e.target.closest('.edit-project-btn');
        const cardBody = e.target.closest('.project-card-body');

        if (editBtn) {
            e.stopPropagation(); // prevent card body click
            const projectId = Number(editBtn.dataset.projectId);
            openProjectModal(projectId);
        } else if (cardBody) {
            const projectId = Number(cardBody.dataset.projectId);
            state.selectedProjectId = projectId;
            switchView('plan', false); // Don't re-fetch data when going to plan view
        }
    });

    document.getElementById('back-to-projects-btn').addEventListener('click', () => { state.selectedProjectId = null; switchView('projects'); });
    document.getElementById('add-task-btn').addEventListener('click', () => openTaskModal());
    document.getElementById('close-task-modal').addEventListener('click', closeTaskModal);
    document.getElementById('task-form').addEventListener('submit', handleTaskFormSubmit);
    document.getElementById('delete-task-btn').addEventListener('click', handleDeleteTask);
    document.getElementById('generate-desc-btn').addEventListener('click', handleGenerateDesc);
    document.getElementById('add-member-btn').addEventListener('click', () => openMemberModal());
    document.getElementById('close-member-modal').addEventListener('click', closeMemberModal);
    document.getElementById('member-form').addEventListener('submit', handleMemberFormSubmit);
    
    document.getElementById('team-list').addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-member-btn');
        if (editBtn) {
            const userId = Number(editBtn.dataset.userId);
            openMemberModal(userId);
        }
    });

    document.getElementById('confirm-cancel-btn').addEventListener('click', closeConfirmModal);
    document.getElementById('confirm-ok-btn').addEventListener('click', () => {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        closeConfirmModal();
    });

    document.getElementById('member-avatar-upload').addEventListener('change', handleAvatarUpload);

    window.addEventListener('click', (event) => {
        if (event.target == projectModal) closeProjectModal();
        if (event.target == taskModal) closeTaskModal();
        if (event.target == memberModal) closeMemberModal();
        if (event.target == confirmModal) closeConfirmModal();
    });
    
    async function handleProjectFormSubmit(e) {
        e.preventDefault();
        const projectId = state.editingProjectId;
        const name = document.getElementById('project-name').value;
        const description = document.getElementById('project-desc').value;
        const color = document.getElementById('project-color').value;
        const iconBase64 = document.getElementById('project-icon-base64').value;
        
        let icon = iconBase64;
        if (!icon && projectId) {
             const existingProject = getProjectById(projectId);
             if (existingProject && existingProject.icon && existingProject.icon.startsWith('data:image')) {
                 icon = existingProject.icon;
             }
        }

        let payload;
        if (projectId) {
            const project = getProjectById(projectId);
            if (project) {
                Object.assign(project, { name, description, icon: icon || '', color });
                payload = { action: 'updateProject', data: project };
            }
        } else {
            const newId = getNewId(state.projects);
            const projectData = { id: newId, name, description, icon: icon || '', color };
            state.projects.push(projectData);
            payload = { action: 'addProject', data: projectData };
        }

        renderAll();
        closeProjectModal();
        if (payload) {
            await postData(payload);
        }
    }

    async function handleDeleteProject() {
        const projectId = state.editingProjectId;
        if (!projectId) return;

        const title = 'ยืนยันการลบโปรเจกต์';
        const text = `คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้? การกระทำนี้จะลบงานทั้งหมด (${state.tasks.filter(t => t.projectId === projectId).length} งาน) ที่อยู่ในโปรเจกต์นี้ด้วย และไม่สามารถย้อนกลับได้`;

        openConfirmModal(title, text, async () => {
            state.projects = state.projects.filter(p => p.id !== projectId);
            state.tasks = state.tasks.filter(t => t.projectId !== projectId);
            
            closeProjectModal();

            if(state.selectedProjectId === projectId) {
                state.selectedProjectId = null;
                switchView('projects');
            } else {
                renderAll();
            }

            await postData({ action: 'deleteProject', data: { id: projectId } });
        });
    }
    
    async function handleTaskFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const assigneeId = document.getElementById('task-assignee').value ? Number(document.getElementById('task-assignee').value) : null;
        const startDate = document.getElementById('task-start-date').value;
        const dueDate = document.getElementById('task-due-date').value;
        const progress = Number(document.getElementById('task-progress').value);
        const status = progress >= 100 ? 'done' : (progress > 0 ? 'inprogress' : 'todo');


        if (new Date(startDate) > new Date(dueDate)) { alert("วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด"); return; }
        
        let payload;
        if (state.editingTaskId) {
            const task = getTaskById(state.editingTaskId);
            Object.assign(task, { title, description, assigneeId, startDate, dueDate, progress, status });
            payload = { action: 'updateTask', data: task };
        } else {
            const newId = getNewId(state.tasks);
            const projectTasks = state.tasks.filter(t => t.projectId === state.selectedProjectId);
            const maxSortIndex = projectTasks.length > 0 ? Math.max(...projectTasks.map(t => typeof t.sortIndex === 'number' ? t.sortIndex : 0)) : -1;
            const newTask = { id: newId, projectId: state.selectedProjectId, title, description, assigneeId, status: 'todo', startDate, dueDate, sortIndex: maxSortIndex + 1, progress: 0 };
            state.tasks.push(newTask);
            payload = { action: 'addTask', data: newTask };
        }
        
        renderAll();
        closeTaskModal();
        await postData(payload);
    }

    async function handleDeleteTask() {
        const taskId = state.editingTaskId;
        if(!taskId) return;

        const title = 'ยืนยันการลบงาน';
        const text = 'คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?';

        openConfirmModal(title, text, async () => {
            state.tasks = state.tasks.filter(t => t.id !== taskId);
            renderAll();
            closeTaskModal();
            await postData({ action: 'deleteTask', data: { id: taskId } });
        });
    }
    
    async function handleMemberFormSubmit(e) {
        e.preventDefault();
        const memberId = document.getElementById('member-id').value ? Number(document.getElementById('member-id').value) : null;
        const name = document.getElementById('member-name').value;
        const role = document.getElementById('member-role').value;
        let avatar = document.getElementById('member-avatar-base64').value.trim();

        if (!avatar) {
            const firstLetters = name.split(' ').map(n => n[0]).join('');
            avatar = `https://placehold.co/100x100/7C3AED/FFFFFF?text=${encodeURIComponent(firstLetters)}`;
        }

        let payload;
        if (memberId) {
            const user = getUserById(memberId);
            Object.assign(user, {name, role, avatar});
            payload = { action: 'updateMember', data: user };
        } else {
            const newId = getNewId(state.users);
            const memberData = { id: newId, name, role, avatar };
            state.users.push(memberData);
            payload = { action: 'addMember', data: memberData };
        }
        
        renderAll();
        closeMemberModal();
        await postData(payload);
    }

    function handleProjectIconUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 200 * 1024) { // Limit to 200KB
            alert("ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 200KB)");
            event.target.value = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 128;
                const MAX_HEIGHT = 128;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

                if (dataUrl.length > 45000) { // Keep it well below 50k limit
                    alert("เกิดข้อผิดพลาด: รูปภาพหลังการบีบอัดยังมีขนาดใหญ่เกินไป โปรดเลือกรูปอื่น");
                    return;
                }
                
                document.getElementById('project-icon-preview').innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover rounded-xl">`;
                document.getElementById('project-icon-base64').value = dataUrl;
            }
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 200 * 1024) { // Limit to 200KB for initial check
            alert("ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 200KB)");
            event.target.value = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 128;
                const MAX_HEIGHT = 128;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Use a lower quality for jpeg to ensure the base64 string is small enough
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                if (dataUrl.length > 45000) { 
                    alert("เกิดข้อผิดพลาด: รูปภาพหลังการบีบอัดยังมีขนาดใหญ่เกินไป โปรดเลือกรูปอื่น");
                    return;
                }

                document.getElementById('avatar-preview').src = dataUrl;
                document.getElementById('member-avatar-base64').value = dataUrl;
            }
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }


    async function handleGenerateDesc() { const taskTitleInput = document.getElementById('task-title'); const taskDescTextarea = document.getElementById('task-desc'); const generateDescBtn = document.getElementById('generate-desc-btn'); const title = taskTitleInput.value.trim(); if (!title) { taskDescTextarea.placeholder = "โปรดกรอกชื่องานก่อน..."; return; } generateDescBtn.disabled = true; generateDescBtn.innerHTML = `<svg class="animate-spin h-4 w-4 mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>กำลังคิด...`; taskDescTextarea.value = "AI กำลังเขียนรายละเอียดให้คุณ..."; const description = await generateTaskDescription(title); taskDescTextarea.value = description; generateDescBtn.disabled = false; generateDescBtn.innerHTML = "✨ ช่วยคิด"; }

    // Initial Load
    (async () => {
        await initializeApp();
    })();

});