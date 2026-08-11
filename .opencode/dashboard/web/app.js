/**
 * app.js — Main application logic.
 * Uses Alpine.js for reactivity and sql.js for client-side SQLite queries.
 */

import { loadDatabase, query, queryOne } from './db.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    loading: true,
    view: 'dashboard',
    locale: (() => {
      const supported = ['es', 'en', 'pt', 'fr'];
      const lang = (navigator.language || 'en').toLowerCase().split('-')[0];
      return supported.includes(lang) ? lang : 'en';
    })(),

    // Project info
    project: { client: '', name: '', summary: '', startDate: null, endDate: null },

    // Dashboard stats
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      journeys: 0,
      specifications: 0,
      decisions: 0,
      totalBugs: 0,
      closedBugs: 0,
      totalTokensConsumed: 0,
      hasObservabilityData: false
    },

    // Board data
    taskGroups: [],
    groupNames: [],
    allTasks: [],
    allTasksOther: [],
    journeys: [],
    docGroups: [],
    aiToolGroups: [],
    specsMap: {},
    observabilitySessions: [],

    // i18n
    locales: {
      es: {
        header_subtitle: 'Panel del Proyecto', loading: 'Cargando base de datos…',
        nav_dashboard: 'Overview', nav_backlog: 'Backlog', nav_tasks: 'Tareas',
        nav_journeys: 'Journeys', nav_documents: 'Documentos', nav_aitools: 'Herramientas IA',
        progress_backlog: '📋 Progreso del Backlog', stories: 'historias',
        time_elapsed: 'del tiempo transcurrido', progress_project: '📅 Progreso del Proyecto',
        stat_items: 'Backlog Items', stat_completed: 'Completadas', stat_pending: 'Pendientes',
        stat_journeys: 'Journeys', stat_specs: 'Especificaciones', stat_decisions: 'Decision Records',
        stat_days_remaining: 'Días Restantes', stat_days_overdue: 'Días de Retraso',
        progress_bugs: '🐛 Bugs', bugs_label: 'bugs cerrados',
        board_title: 'Backlog por Dominio', chip_total: 'Total', chip_pending: 'Pendiente', more_items: 'más', epic_completed: '✓ Épica completada',
        view_backlog: 'Product Backlog', view_tasks: 'Tareas', view_journeys: 'Journey Maps',
        view_documents: 'Documentos del Proyecto', view_aitools: 'Herramientas IA',
        filter_desc: 'Descripción:', filter_placeholder: 'Buscar...', filter_domain: 'Dominio:',
        filter_status: 'Estado:', filter_owner: 'Responsable:', filter_sprint: 'Sprint:', filter_file: 'Archivo:',
        filter_all: 'Todos', filter_pending: 'Pendiente', filter_done: 'Completado',
        th_status: 'Estado', th_id: 'ID', th_description: 'Descripción', th_domain: 'Dominio',
        th_owner: 'Responsable', th_sprint: 'Sprint', th_priority: 'Prioridad', th_file: 'Archivo',
        'doctype_project-brief': 'Resumen del Proyecto', doctype_sow: 'Statement of Work', doctype_prd: 'PRD',
        doctype_discovery: 'Discovery', doctype_analysis: 'Análisis / Journeys', doctype_architecture: 'Arquitectura',
        'doctype_decision-record': 'Decision Records', doctype_specification: 'Especificaciones',
        'doctype_meeting-notes': 'Notas de Reunión', doctype_transcript: 'Transcripciones',
        'doctype_tech-manual': 'Manual Técnico', 'doctype_user-manual': 'Manual de Usuario',
        'doctype_change-management': 'Gestión de Cambios', 'doctype_risk-management': 'Gestión de Riesgos',
        doctype_management: 'Gestión de Proyecto', doctype_reference: 'Referencias',
        aitool_skill: 'Skills', aitool_prompt: 'Prompts', aitool_agent: 'Agentes', aitool_instructions: 'Instrucciones',
        stat_total_tokens: 'Tokens IA Consumidos',
        nav_observability: 'Observabilidad', view_observability: 'Observabilidad IA',
        obs_session_name: 'Sesión', obs_date: 'Fecha', obs_user: 'Usuario',
        obs_llm_calls: 'Llamadas LLM', obs_tokens_total: 'Tokens', obs_duration: 'Duración',
        obs_summary_global: 'Resumen Global', obs_git_user: 'Usuario Git',
        obs_models: 'Modelos', obs_model_name: 'Modelo', obs_calls: 'Llamadas',
        obs_agent_flow: 'Flujo de Agentes', obs_agent_flow_none: 'Sin flujo de agentes registrado'
      },
      en: {
        header_subtitle: 'Project Dashboard', loading: 'Loading database…',
        nav_dashboard: 'Overview', nav_backlog: 'Backlog', nav_tasks: 'Tasks',
        nav_journeys: 'Journeys', nav_documents: 'Documents', nav_aitools: 'AI Tools',
        progress_backlog: '📋 Backlog Progress', stories: 'stories',
        time_elapsed: 'of time elapsed', progress_project: '📅 Project Progress',
        stat_items: 'Backlog Items', stat_completed: 'Completed', stat_pending: 'Pending',
        stat_journeys: 'Journeys', stat_specs: 'Specifications', stat_decisions: 'Decision Records',
        stat_days_remaining: 'Days Remaining', stat_days_overdue: 'Days Overdue',
        progress_bugs: '🐛 Bugs', bugs_label: 'bugs closed',
        board_title: 'Backlog by Domain', chip_total: 'Total', chip_pending: 'Pending', more_items: 'more', epic_completed: '✓ Epic completed',
        view_backlog: 'Product Backlog', view_tasks: 'Tasks', view_journeys: 'Journey Maps',
        view_documents: 'Project Documents', view_aitools: 'AI Tools',
        filter_desc: 'Description:', filter_placeholder: 'Search...', filter_domain: 'Domain:',
        filter_status: 'Status:', filter_owner: 'Owner:', filter_sprint: 'Sprint:', filter_file: 'File:',
        filter_all: 'All', filter_pending: 'Pending', filter_done: 'Completed',
        th_status: 'Status', th_id: 'ID', th_description: 'Description', th_domain: 'Domain',
        th_owner: 'Owner', th_sprint: 'Sprint', th_priority: 'Priority', th_file: 'File',
        'doctype_project-brief': 'Project Brief', doctype_sow: 'Statement of Work', doctype_prd: 'PRD',
        doctype_discovery: 'Discovery', doctype_analysis: 'Analysis / Journeys', doctype_architecture: 'Architecture',
        'doctype_decision-record': 'Decision Records', doctype_specification: 'Specifications',
        'doctype_meeting-notes': 'Meeting Notes', doctype_transcript: 'Transcripts',
        'doctype_tech-manual': 'Technical Manual', 'doctype_user-manual': 'User Manual',
        'doctype_change-management': 'Change Management', 'doctype_risk-management': 'Risk Management',
        doctype_management: 'Project Management', doctype_reference: 'References',
        aitool_skill: 'Skills', aitool_prompt: 'Prompts', aitool_agent: 'Agents', aitool_instructions: 'Instructions',
        stat_total_tokens: 'AI Tokens Consumed',
        nav_observability: 'Observability', view_observability: 'AI Observability',
        obs_session_name: 'Session', obs_date: 'Date', obs_user: 'User',
        obs_llm_calls: 'LLM Calls', obs_tokens_total: 'Tokens', obs_duration: 'Duration',
        obs_summary_global: 'Global Summary', obs_git_user: 'Git User',
        obs_models: 'Models', obs_model_name: 'Model', obs_calls: 'Calls',
        obs_agent_flow: 'Agent Flow', obs_agent_flow_none: 'No agent flow recorded'
      },
      pt: {
        header_subtitle: 'Painel do Projeto', loading: 'Carregando banco de dados…',
        nav_dashboard: 'Visão Geral', nav_backlog: 'Backlog', nav_tasks: 'Tarefas',
        nav_journeys: 'Jornadas', nav_documents: 'Documentos', nav_aitools: 'Ferramentas IA',
        progress_backlog: '📋 Progresso do Backlog', stories: 'histórias',
        time_elapsed: 'do tempo decorrido', progress_project: '📅 Progresso do Projeto',
        stat_items: 'Itens do Backlog', stat_completed: 'Concluídas', stat_pending: 'Pendentes',
        stat_journeys: 'Jornadas', stat_specs: 'Especificações', stat_decisions: 'Registros de Decisão',
        stat_days_remaining: 'Dias Restantes', stat_days_overdue: 'Dias de Atraso',
        progress_bugs: '🐛 Bugs', bugs_label: 'bugs fechados',
        board_title: 'Backlog por Domínio', chip_total: 'Total', chip_pending: 'Pendente', more_items: 'mais', epic_completed: '✓ Épico concluído',
        view_backlog: 'Product Backlog', view_tasks: 'Tarefas', view_journeys: 'Mapas de Jornada',
        view_documents: 'Documentos do Projeto', view_aitools: 'Ferramentas IA',
        filter_desc: 'Descrição:', filter_placeholder: 'Pesquisar...', filter_domain: 'Domínio:',
        filter_status: 'Estado:', filter_owner: 'Responsável:', filter_sprint: 'Sprint:', filter_file: 'Arquivo:',
        filter_all: 'Todos', filter_pending: 'Pendente', filter_done: 'Concluído',
        th_status: 'Estado', th_id: 'ID', th_description: 'Descrição', th_domain: 'Domínio',
        th_owner: 'Responsável', th_sprint: 'Sprint', th_priority: 'Prioridade', th_file: 'Arquivo',
        'doctype_project-brief': 'Resumo do Projeto', doctype_sow: 'Declaração de Trabalho', doctype_prd: 'PRD',
        doctype_discovery: 'Descoberta', doctype_analysis: 'Análise / Jornadas', doctype_architecture: 'Arquitetura',
        'doctype_decision-record': 'Registros de Decisão', doctype_specification: 'Especificações',
        'doctype_meeting-notes': 'Notas de Reunião', doctype_transcript: 'Transcrições',
        'doctype_tech-manual': 'Manual Técnico', 'doctype_user-manual': 'Manual do Usuário',
        'doctype_change-management': 'Gestão de Mudanças', 'doctype_risk-management': 'Gestão de Riscos',
        doctype_management: 'Gestão do Projeto', doctype_reference: 'Referências',
        aitool_skill: 'Skills', aitool_prompt: 'Prompts', aitool_agent: 'Agentes', aitool_instructions: 'Instruções',
        stat_total_tokens: 'Tokens IA Consumidos',
        nav_observability: 'Observabilidade', view_observability: 'Observabilidade IA',
        obs_session_name: 'Sessão', obs_date: 'Data', obs_user: 'Usuário',
        obs_llm_calls: 'Chamadas LLM', obs_tokens_total: 'Tokens', obs_duration: 'Duração',
        obs_summary_global: 'Resumo Global', obs_git_user: 'Usuário Git',
        obs_models: 'Modelos', obs_model_name: 'Modelo', obs_calls: 'Chamadas',
        obs_agent_flow: 'Fluxo de Agentes', obs_agent_flow_none: 'Sem fluxo de agentes registrado'
      },
      fr: {
        header_subtitle: 'Tableau de Bord', loading: 'Chargement de la base…',
        nav_dashboard: 'Aperçu', nav_backlog: 'Backlog', nav_tasks: 'Tâches',
        nav_journeys: 'Parcours', nav_documents: 'Documents', nav_aitools: 'Outils IA',
        progress_backlog: '📋 Avancement du Backlog', stories: 'histoires',
        time_elapsed: 'du temps écoulé', progress_project: '📅 Avancement du Projet',
        stat_items: 'Éléments Backlog', stat_completed: 'Terminées', stat_pending: 'En attente',
        stat_journeys: 'Parcours', stat_specs: 'Spécifications', stat_decisions: 'Décisions',
        stat_days_remaining: 'Jours Restants', stat_days_overdue: 'Jours de Retard',
        progress_bugs: '🐛 Bugs', bugs_label: 'bugs fermés',
        board_title: 'Backlog par Domaine', chip_total: 'Total', chip_pending: 'En attente', more_items: 'de plus', epic_completed: '✓ Épique terminée',
        view_backlog: 'Product Backlog', view_tasks: 'Tâches', view_journeys: 'Cartes de Parcours',
        view_documents: 'Documents du Projet', view_aitools: 'Outils IA',
        filter_desc: 'Description :', filter_placeholder: 'Rechercher...', filter_domain: 'Domaine :',
        filter_status: 'Statut :', filter_owner: 'Responsable :', filter_sprint: 'Sprint :', filter_file: 'Fichier :',
        filter_all: 'Tous', filter_pending: 'En attente', filter_done: 'Terminé',
        th_status: 'Statut', th_id: 'ID', th_description: 'Description', th_domain: 'Domaine',
        th_owner: 'Responsable', th_sprint: 'Sprint', th_priority: 'Priorité', th_file: 'Fichier',
        'doctype_project-brief': 'Présentation du Projet', doctype_sow: 'Énoncé des travaux', doctype_prd: 'PRD',
        doctype_discovery: 'Découverte', doctype_analysis: 'Analyse / Parcours', doctype_architecture: 'Architecture',
        'doctype_decision-record': 'Registres de décision', doctype_specification: 'Spécifications',
        'doctype_meeting-notes': 'Notes de réunion', doctype_transcript: 'Transcriptions',
        'doctype_tech-manual': 'Manuel technique', 'doctype_user-manual': 'Manuel utilisateur',
        'doctype_change-management': 'Gestion des changements', 'doctype_risk-management': 'Gestion des risques',
        doctype_management: 'Gestion de projet', doctype_reference: 'Références',
        aitool_skill: 'Skills', aitool_prompt: 'Prompts', aitool_agent: 'Agents', aitool_instructions: 'Instructions',
        stat_total_tokens: 'Tokens IA Consommés',
        nav_observability: 'Observabilité', view_observability: 'Observabilité IA',
        obs_session_name: 'Session', obs_date: 'Date', obs_user: 'Utilisateur',
        obs_llm_calls: 'Appels LLM', obs_tokens_total: 'Tokens', obs_duration: 'Durée',
        obs_summary_global: 'Résumé Global', obs_git_user: 'Utilisateur Git',
        obs_models: 'Modèles', obs_model_name: 'Modèle', obs_calls: 'Appels',
        obs_agent_flow: 'Flux des Agents', obs_agent_flow_none: 'Aucun flux d\'agents enregistré'
      }
    },

    // Filters (backlog)
    filterText: '',
    filterGroup: '',
    filterObsText: '',

    filterStatus: '',
    filterOwner: '',
    filterSprint: '',

    // Filters (tasks)
    filterTaskFile: '',
    filterTaskStatus: '',
    filterTaskOwner: '',

    get taskFileNames() {
      return [...new Set(this.allTasksOther.map(t => t.fileName))].sort();
    },

    get taskOwnerNames() {
      return [...new Set(this.allTasksOther.map(t => t.owner).filter(Boolean))].sort();
    },

    get filteredAllTasks() {
      return this.allTasksOther.filter(t => {
        if (this.filterTaskFile && t.fileName !== this.filterTaskFile) return false;
        if (this.filterTaskStatus === 'done' && !t.checked) return false;
        if (this.filterTaskStatus === 'pending' && t.checked) return false;
        if (this.filterTaskOwner && t.owner !== this.filterTaskOwner) return false;
        return true;
      });
    },

    get ownerNames() {
      return [...new Set(this.allTasks.map(t => t.owner).filter(Boolean))].sort();
    },

    get sprintNames() {
      return [...new Set(this.allTasks.map(t => t.sprint).filter(Boolean))]
        .sort((a, b) => {
          const na = parseInt(a.replace(/\D/g, '')) || 0;
          const nb = parseInt(b.replace(/\D/g, '')) || 0;
          return na - nb;
        });
    },

    t(key) {
      return this.locales[this.locale]?.[key] ?? key;
    },

    get dateLocale() {
      const map = { es: 'es-ES', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR' };
      return map[this.locale] || 'es-ES';
    },

    get bugsProgressPct() {
      if (!this.stats.totalBugs) return 0;
      return Math.round((this.stats.closedBugs / this.stats.totalBugs) * 100);
    },

    get storiesProgressPct() {
      if (!this.stats.totalTasks) return 0;
      return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
    },

    get timelineProgressPct() {
      if (!this.project.startDate || !this.project.endDate) return 0;
      const start = new Date(this.project.startDate).getTime();
      const end = new Date(this.project.endDate).getTime();
      const now = Date.now();
      if (now <= start) return 0;
      if (now >= end) return 100;
      return Math.round(((now - start) / (end - start)) * 100);
    },

    get timelineTodayLabel() {
      return new Date().toLocaleDateString(this.dateLocale, { day: '2-digit', month: 'short' });
    },

    get startDateLabel() {
      if (!this.project.startDate) return '';
      return new Date(this.project.startDate).toLocaleDateString(this.dateLocale, { day: '2-digit', month: 'short', year: 'numeric' });
    },

    get endDateLabel() {
      if (!this.project.endDate) return '';
      return new Date(this.project.endDate).toLocaleDateString(this.dateLocale, { day: '2-digit', month: 'short', year: 'numeric' });
    },

    get daysRemaining() {
      if (!this.project.endDate) return null;
      const diff = new Date(this.project.endDate).setHours(23,59,59) - Date.now();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    get filteredTasks() {
      const q = this.filterText.toLowerCase();
      return this.allTasks.filter(t => {
        if (q && !t.shortDesc.toLowerCase().includes(q)) return false;
        if (this.filterGroup && t.groupBy !== this.filterGroup) return false;
        if (this.filterStatus === 'done' && !t.checked) return false;
        if (this.filterStatus === 'pending' && t.checked) return false;
        if (this.filterOwner && t.owner !== this.filterOwner) return false;
        if (this.filterSprint && t.sprint !== this.filterSprint) return false;
        return true;
      });
    },

    async init() {
      document.documentElement.lang = this.locale;
      this.$watch('locale', val => { document.documentElement.lang = val; });
      try {
        await loadDatabase();
        this.loadProjectInfo();
        this.loadStats();
        this.loadSpecs();
        this.loadTasks();
        this.loadAllTasks();
        this.loadJourneys();
        this.loadDocuments();
        this.loadAiTools();
        this.loadObservabilitySessions();
      } catch (err) {
        console.error('Failed to load database:', err);
      } finally {
        this.loading = false;
      }
    },

    loadProjectInfo() {
      const row = queryOne("SELECT metadata FROM files WHERE file_path = 'README.md'");
      if (row) {
        const meta = this.parseMeta(row.metadata);
        this.project.client = meta.client || '';
        this.project.name = meta.project || '';
        this.project.summary = meta.summary || '';
        this.project.startDate = meta['project-start-date'] || null;
        this.project.endDate = meta['project-end-date'] || null;
      }
    },

    loadStats() {
      const total = queryOne(
        "SELECT COUNT(*) as cnt FROM tasks t INNER JOIN files f ON t.file = f._id WHERE f.file_path LIKE '%product-backlog%' AND t.description NOT LIKE 'BUG-%'"
      );
      const completed = queryOne(
        "SELECT COUNT(*) as cnt FROM tasks t INNER JOIN files f ON t.file = f._id WHERE f.file_path LIKE '%product-backlog%' AND t.checked = 1 AND t.description NOT LIKE 'BUG-%'"
      );
      const journeys = queryOne("SELECT COUNT(*) as cnt FROM files WHERE filetype = 'analysis' AND file_path LIKE '%journey%'");
      // Count distinct story-id values across specification files
      const specRows = query("SELECT metadata FROM files WHERE filetype = 'specification' AND metadata LIKE '%story-id%'");
      const specIds = new Set(specRows.map(r => {
        const meta = this.parseMeta(r.metadata);
        return meta['story-id'] || meta['storyId'] || meta['story_id'] || null;
      }).filter(Boolean));
      const decisions = queryOne("SELECT COUNT(*) as cnt FROM files WHERE filetype = 'decision-record'");
      const totalBugs = queryOne(
        "SELECT COUNT(*) as cnt FROM tasks t INNER JOIN files f ON t.file = f._id WHERE f.file_path LIKE '%product-backlog%' AND t.description LIKE 'BUG-%'"
      );
      const closedBugs = queryOne(
        "SELECT COUNT(*) as cnt FROM tasks t INNER JOIN files f ON t.file = f._id WHERE f.file_path LIKE '%product-backlog%' AND t.description LIKE 'BUG-%' AND t.checked = 1"
      );

      this.stats.totalTasks = total?.cnt || 0;
      this.stats.completedTasks = completed?.cnt || 0;
      this.stats.pendingTasks = (total?.cnt || 0) - (completed?.cnt || 0);
      this.stats.journeys = journeys?.cnt || 0;
      this.stats.specifications = specIds.size;
      this.stats.decisions = decisions?.cnt || 0;
      this.stats.totalBugs = totalBugs?.cnt || 0;
      this.stats.closedBugs = closedBugs?.cnt || 0;

      const observabilityRows = query("SELECT metadata FROM files WHERE filetype = 'observability'");
      if (observabilityRows.length > 0) {
        this.stats.hasObservabilityData = true;
        this.stats.totalTokensConsumed = observabilityRows.reduce((sum, row) => {
          const meta = this.parseMeta(row.metadata);
          return sum + (meta?.summaryGlobal?.totalTokenConsumed || 0);
        }, 0);
      }
    },

    loadTasks() {
      const rows = query(
        "SELECT t.description, t.checked, t.metadata, t.due, t.file FROM tasks t " +
        "INNER JOIN files f ON t.file = f._id " +
        "WHERE f.file_path LIKE '%product-backlog%'"
      );

      this.allTasks = rows.map(row => {
        const meta = this.parseMeta(row.metadata);
        const desc = row.description || '';
        // Try metadata first, fall back to parsing from start of text
        const metaId = meta['story-id'] || meta['storyId'] || meta['id'];
        const textMatch = desc.match(/^(US-\d+|ARC-\d+|DEV-\d+|BUG-\d+)/);
        const id = metaId ? metaId.toUpperCase() : (textMatch ? textMatch[1] : null);
        const shortDesc = desc.replace(/\[[\w]+::\s*[^\]]*\]/g, '').trim();
        return {
          description: desc,
          shortDesc,
          id,
          checked: !!row.checked,
          groupBy: meta.groupBy || 'otros',
          priority: meta.priority ? parseInt(meta.priority) : null,
          priorityEmoji: this.priorityEmoji(meta.priority ? parseInt(meta.priority) : null),
          owner: meta.owner || null,
          sprint: meta.sprint || null,
          due: meta.due || row.due || null,
          expanded: false,
          specs: id ? (this.specsMap[id] || []) : []
        };
      });

      // Group by domain
      const groups = {};
      for (const task of this.allTasks) {
        const name = task.groupBy || 'sin grupo';
        if (!groups[name]) groups[name] = [];
        groups[name].push(task);
      }

      this.taskGroups = Object.entries(groups)
        .map(([name, tasks]) => ({ name, tasks, pendingTasks: tasks.filter(t => !t.checked) }))
        .sort((a, b) => b.pendingTasks.length - a.pendingTasks.length);

      this.groupNames = this.taskGroups.map(g => g.name);
    },

    loadAllTasks() {
      const rows = query(
        "SELECT t.description, t.checked, t.metadata, f.file_path FROM tasks t " +
        "INNER JOIN files f ON t.file = f._id " +
        "WHERE f.file_path NOT LIKE '%product-backlog%' " +
        "AND f.file_path NOT LIKE '.%' " +
        "AND f.file_path NOT LIKE '4-specs%' " +
        "ORDER BY f.file_path, t.description"
      );
      // Exclude tasks from hidden directories (starting with .)
      const filtered = rows.filter(r => !r.file_path.split(/[\\/]/)[0].startsWith('.'));

      this.allTasksOther = filtered.map(row => {
        const meta = this.parseMeta(row.metadata);
        const desc = row.description || '';
        const idMatch = desc.match(/^([A-Z]+-\d+)/);
        const shortDesc = desc.replace(/\[[\w]+::\s*[^\]]*\]/g, '').trim();
        const fileName = row.file_path.split(/[\\/]/).pop().replace(/\.md$/, '');
        return {
          description: desc,
          shortDesc,
          id: idMatch ? idMatch[1] : null,
          checked: !!row.checked,
          owner: meta.owner || null,
          fileName,
          file: row.file_path,
          fileUrl: window.location.origin + '/' + row.file_path
        };
      });
    },

    loadAiTools() {
      const rows = query(
        "SELECT file_path, metadata FROM files WHERE " +
        "file_path LIKE '%.agent.md' OR file_path LIKE '%.instructions.md' OR " +
        "file_path LIKE '%.prompt.md' OR (file_path LIKE '%SKILL.md' AND file_path NOT LIKE '%resources%')"
      );

      const typeConfig = {
        skill:        { label: 'Skills', icon: '🧠', order: 1 },
        prompt:       { label: 'Prompts', icon: '📝', order: 2 },
        agent:        { label: 'Agents', icon: '🤖', order: 3 },
        instructions: { label: 'Instructions', icon: '👮', order: 4 }
      };

      const grouped = { skill: [], prompt: [], agent: [], instructions: [] };

      for (const row of rows) {
        const meta = this.parseMeta(row.metadata);
        const path = row.file_path;
        let type;
        if (/SKILL\.md$/i.test(path))                   type = 'skill';
        else if (/\.agent\.md$/i.test(path))            type = 'agent';
        else if (/\.prompt\.md$/i.test(path))           type = 'prompt';
        else if (/\.instructions\.md$/i.test(path))     type = 'instructions';
        else continue;

        grouped[type].push({
          path,
          name: meta.name || path.split(/[\\/]/).pop().replace(/\.(agent|prompt|instructions|SKILL)\.md$/i, ''),
          description: meta.description || ''
        });
      }

      this.aiToolGroups = Object.entries(grouped)
        .filter(([, items]) => items.length > 0)
        .map(([type, items]) => ({
          type,
          label: typeConfig[type].label,
          icon: typeConfig[type].icon,
          order: typeConfig[type].order,
          collapsed: true,
          items: items.sort((a, b) => a.name.localeCompare(b.name))
        }))
        .sort((a, b) => a.order - b.order);
    },

    loadJourneys() {
      const rows = query("SELECT file_path, metadata FROM files WHERE filetype = 'analysis' AND file_path LIKE '%journey%'");
      this.journeys = rows.map(row => {
        const meta = this.parseMeta(row.metadata);
        return {
          path: row.file_path,
          url: '/' + row.file_path.replace(/\\/g, '/'),
          title: meta.title || this.fileNameToTitle(row.file_path),
          date: meta.date || null
        };
      });
    },

    loadDocuments() {
      const rows = query("SELECT file_path, filetype, metadata FROM files WHERE extension = 'md' AND filetype IS NOT NULL ORDER BY filetype, file_path");

      const typeConfig = {
        'project-brief': { label: 'Project Brief', icon: '📋', order: 1 },
        'sow': { label: 'Statement of Work', icon: '📝', order: 2 },
        'prd': { label: 'PRD', icon: '📊', order: 3 },
        'discovery': { label: 'Discovery', icon: '🔍', order: 4 },
        'analysis': { label: 'Análisis / Journeys', icon: '🗺️', order: 5 },
        'architecture': { label: 'Arquitectura', icon: '🏗️', order: 6 },
        'decision-record': { label: 'Decision Records', icon: '⚖️', order: 7 },
        'specification': { label: 'Especificaciones', icon: '📐', order: 8 },
        'meeting-notes': { label: 'Notas de Reunión', icon: '🗓️', order: 9 },
        'transcript': { label: 'Transcripciones', icon: '🎙️', order: 10 },
        'tech-manual': { label: 'Manual Técnico', icon: '🔧', order: 11 },
        'user-manual': { label: 'Manual de Usuario', icon: '📖', order: 12 },
        'change-management': { label: 'Gestión de Cambios', icon: '🔄', order: 13 },
        'risk-management': { label: 'Gestión de Riesgos', icon: '⚠️', order: 14 },
        'management': { label: 'Gestión de Proyecto', icon: '📅', order: 15 },
        'reference': { label: 'Referencias', icon: '📚', order: 16 }
      };

      const grouped = {};
      for (const row of rows) {
        const type = row.filetype;
        if (!grouped[type]) grouped[type] = [];
        const meta = this.parseMeta(row.metadata);
        grouped[type].push({
          path: row.file_path,
          url: '/' + row.file_path.replace(/\\/g, '/'),
          title: meta.title || this.fileNameToTitle(row.file_path)
        });
      }

      this.docGroups = Object.entries(grouped)
        .map(([type, files]) => ({
          type,
          label: typeConfig[type]?.label || type,
          icon: typeConfig[type]?.icon || '📄',
          order: typeConfig[type]?.order || 99,
          files,
          collapsed: true
        }))
        .sort((a, b) => a.order - b.order);
    },

    priorityEmoji(p) {
      const map = { 1: '⭐', 2: '⭐⭐', 3: '⭐🔥🔥', 4: '🔥🔥🔥🔥', 5: '🔥🔥🔥🔥🔥' };
      return map[p] !== undefined ? map[p] : (p !== null ? String(p) : '—');
    },

    loadSpecs() {
      const rows = query(
        "SELECT file_path, metadata FROM files WHERE metadata LIKE '%story-id%'"
      );
      const map = {};
      for (const row of rows) {
        const meta = this.parseMeta(row.metadata);
        const storyId = meta['story-id'] || meta['storyId'] || meta['story_id'];
        if (!storyId) continue;
        const id = storyId.toUpperCase();
        if (!map[id]) map[id] = [];
        const parts = row.file_path.replace(/\\/g, '/').split('/');
        const fileName = parts[parts.length - 1];
        map[id].push({
          path: row.file_path,
          url: '/' + row.file_path.replace(/\\/g, '/'),
          fileName,
          title: meta.title || this.specFriendlyName(fileName),
          icon: this.specIcon(fileName)
        });
      }
      this.specsMap = map;
    },

    specFriendlyName(fileName) {
      const names = {
        'functional-spec.md': 'Functional Spec',
        'tech-spec.md': 'Tech Spec',
        'backend-task-list.md': 'Backend Tasks',
        'web-task-list.md': 'Web Tasks',
        'bug-spec.md': 'Bug Spec'
      };
      return names[fileName] || fileName.replace('.md', '');
    },

    specIcon(fileName) {
      if (fileName.includes('functional')) return '📄';
      if (fileName.includes('tech-spec')) return '⚙️';
      if (fileName.includes('backend')) return '🔧';
      if (fileName.includes('web-task')) return '🌐';
      if (fileName.includes('bug')) return '🐛';
      return '📎';
    },

    parseMeta(metaStr) {
      try {
        return JSON.parse(metaStr || '{}');
      } catch {
        return {};
      }
    },

    formatTokens(n) {
      if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
      return n.toString();
    },

    formatDuration(ms) {
      if (!ms) return '—';
      const totalSec = Math.floor(ms / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      if (mins === 0) return `${secs}s`;
      return `${mins}m ${secs}s`;
    },

    get filteredObservabilitySessions() {
      const q = this.filterObsText.toLowerCase().trim();
      if (!q) return this.observabilitySessions;
      return this.observabilitySessions.filter(s =>
        (s.sessionName || '').toLowerCase().includes(q)
      );
    },

    loadObservabilitySessions() {
      const rows = query(
        "SELECT file_path, metadata FROM files WHERE filetype = 'observability' ORDER BY file_path DESC"
      );
      this.observabilitySessions = rows.map(row => {
        const meta = this.parseMeta(row.metadata);
        const start = meta.sessionStartTime ? new Date(meta.sessionStartTime) : null;
        const end = meta.sessionEndTime ? new Date(meta.sessionEndTime) : null;
        return {
          path: row.file_path,
          url: window.location.origin + '/' + row.file_path,
          sessionName: meta.sessionName || row.file_path,
          startTime: start,
          durationMs: (start && end) ? (end - start) : null,
          gitUser: meta.gitUser || {},
          summaryGlobal: meta.summaryGlobal || {},
          models: Array.isArray(meta.models) ? meta.models : [],
          copilotVersion: meta.copilotVersion || '',
          vscodeVersion: meta.vscodeVersion || '',
          expanded: false
        };
      });
    },

    async loadAgentFlow(session) {
      if (session.agentFlow !== undefined) return; // already loaded
      try {
        const res = await fetch('/' + session.path);
        if (!res.ok) { session.agentFlow = null; return; }
        const text = await res.text();
        // Extract mermaid block from ## Agent Flow section
        const match = text.match(/##\s+Agent Flow[\s\S]*?```mermaid([\s\S]*?)```/);
        if (!match) { session.agentFlow = null; return; }
        session.agentFlow = match[1].trim();
        // Render after DOM updates
        await this.$nextTick();
        const id = 'mermaid-' + session.path.replace(/[^a-z0-9]/gi, '_');
        const el = document.getElementById(id);
        if (el && window.mermaid) {
          const { svg } = await window.mermaid.render(id + '_svg', session.agentFlow);
          el.innerHTML = svg;
        }
      } catch (e) {
        session.agentFlow = null;
      }
    },

    fileNameToTitle(path) {
      const name = path.split(/[\\/]/).pop().replace(/\.md$/, '');
      return name
        .replace(/^\d{8}-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
  }));
});
