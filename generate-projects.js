#!/usr/bin/env node
/**
 * generate-projects.js
 * 
 * Автоматическая генерация Markdown файлов проектов из _data/projects.json
 * 
 * Запуск:
 *   node generate-projects.js
 * 
 * Результат:
 *   _projects/{project-id}.md для каждого проекта из JSON
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECTS_DATA_PATH = path.join(__dirname, '_data', 'projects.json');
const PROJECTS_DIR = path.join(__dirname, '_projects');

// Цвета для тегов (соответствуют стилям)
const TECH_COLORS = {
    'nodejs': '#339933',
    'python': '#3572A5',
    'javascript': '#f1e05a',
    'typescript': '#3178c6',
    'react': '#61dafb',
    'vue': '#42b883',
    'angular': '#dd0031',
    'django': '#092e20',
    'flask': '#000000',
    'fastapi': '#009688',
    'postgresql': '#336791',
    'mysql': '#00758f',
    'mongodb': '#47a248',
    'redis': '#dc382d',
    'docker': '#2496ed',
    'kubernetes': '#326ce5',
    'nginx': '#009639',
    'nginx-proxy-manager': '#de4c4f',
    'express': '#4f7a60',
    'prisma': '#2d3748',
    'graphql': '#e10098',
    'rest': '#000000',
    'grpc': '#4285f4',
    'rabbitmq': '#ff6600',
    'kafka': '#23856e',
    'elasticsearch': '#005571',
    'prometheus': '#e6522c',
    'grafana': '#f46800',
    'jenkins': '#d24939',
    'gitlab': '#fc6d26',
    'github-actions': '#2088ff',
    'aws': '#ff9900',
    'gcp': '#4285f4',
    'azure': '#0078d4',
    'linux': '#fcc624',
    'bash': '#4eaa25',
    'html': '#e34c26',
    'css': '#563d7c',
    'sass': '#cd6799',
    'less': '#1d365d',
    'tailwind': '#38b2ac',
    'webpack': '#8dd6f9',
    'vite': '#646cff',
    'eslint': '#4b32c3',
    'prettier': '#f7b93e',
    'jest': '#c21325',
    'mocha': '#8d6748',
    'cypress': '#17c674',
    'playwright': '#2e55f6',
    'php': '#4F5D95',
    'laravel': '#ff2d20',
    'symfony': '#000000',
    'java': '#b07219',
    'spring': '#6db33f',
    'go': '#00ADD8',
    'rust': '#dea584',
    'kotlin': '#A97BFF',
    'scala': '#dc322f',
    'ruby': '#701516',
    'swift': '#F05138',
    'dart': '#00B4AB',
    'flutter': '#02569B',
    'unity': '#000000',
    'unreal': '#0e1128',
    'threejs': '#0077ff',
    'tensorflow': '#ff6f00',
    'pytorch': '#ee4c2c',
    'scikit-learn': '#f7931e',
    'pandas': '#150458',
    'numpy': '#013243',
    'matplotlib': '#11557c',
    'seaborn': '#05395a',
    'opencv': '#5d7687',
    'opencv-python': '#5d7687',
    'opencv-js': '#5d7687'
};

// Функция для получения цвета технологии
function getTechColor(techId) {
    return TECH_COLORS[techId.toLowerCase()] || '#6366f1';
}

// Функция для экранирования спецсимволов в YAML
function escapeYAML(value) {
    if (!value) return '';
    // Если строка содержит спецсимволы, оборачиваем в кавычки
    if (value.includes(':') || value.includes('"') || value.includes('\n') ||
        value.startsWith(' ') || value.startsWith('\'') || value.startsWith('"')) {
        return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
}

// Функция для преобразования CamelCase в kebab-case
function toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Функция для генерации slug из ID
function generateSlug(projectId) {
    return projectId;
}

// Чтение JSON данных
function readProjectsData() {
    try {
        const data = fs.readFileSync(PROJECTS_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Ошибка чтения ${PROJECTS_DATA_PATH}:`, error.message);
        process.exit(1);
    }
}

// Генерация Front Matter для проекта
function generateFrontMatter(project) {
    const sections = project.sections || [];
    const screenshots = project.screenshots || [];

    let frontMatter = '---\n';
    frontMatter += 'layout: project\n';
    frontMatter += `id: ${project.id}\n`;
    frontMatter += `title: ${escapeYAML(project.title)}\n`;
    frontMatter += `description: ${escapeYAML(project.description)}\n`;
    frontMatter += `year: ${project.year}\n`;
    frontMatter += `status: ${project.status}\n`;

    if (project.url) {
        frontMatter += `url: ${project.url}\n`;
    }

    if (project.releases_url) {
        frontMatter += `releases_url: ${project.releases_url}\n`;
    }

    // Секции
    if (sections.length > 0) {
        frontMatter += 'sections:\n';
        sections.forEach(section => {
            frontMatter += `  - title: ${escapeYAML(section.title)}\n`;
            frontMatter += `    content: ${escapeYAML(section.content)}\n`;
        });
    }

    // Скриншоты
    if (screenshots.length > 0) {
        frontMatter += 'screenshots:\n';
        screenshots.forEach(screenshot => {
            frontMatter += `  - path: ${screenshot.path}\n`;
            frontMatter += `    title: ${escapeYAML(screenshot.title)}\n`;
            frontMatter += `    desc: ${escapeYAML(screenshot.desc || '')}\n`;
        });
    }

    frontMatter += '---\n';

    return frontMatter;
}

// Генерация содержимого Markdown файла (после Front Matter)
function generateMarkdownContent(project, projectTechs) {
    let content = '';

    // Краткое описание
    content += `## 📌 Обзор\n\n`;
    content += `${project.description}\n\n`;

    // Технологии
    if (projectTechs.length > 0) {
        content += `## 🛠️ Технологии\n\n`;
        const techNames = projectTechs.map(t => `**${t.name}**`).join(', ');
        content += `${techNames}\n\n`;
    }

    // Детальные секции
    if (project.sections && project.sections.length > 0) {
        content += `## 📖 Подробнее\n\n`;
        project.sections.forEach(section => {
            content += `### ${section.title}\n\n`;
            content += `${section.content}\n\n`;
        });
    }

    // Скриншоты (ссылки, т.к. изображения будут в asset'ах)
    if (project.screenshots && project.screenshots.length > 0) {
        content += `## 🖼️ Скриншоты\n\n`;
        project.screenshots.forEach((screenshot, index) => {
            content += `![${screenshot.title}](${screenshot.path})\n\n`;
        });
    }

    // Ссылки
    content += `## 🔗 Ссылки\n\n`;
    if (project.url) {
        content += `- **GitHub:** [Открыть](${project.url})\n`;
    }
    if (project.releases_url) {
        content += `- **Релизы:** [Открыть](${project.releases_url})\n`;
    }
    if (!project.url && !project.releases_url) {
        content += `- Проект не имеет публичных ссылок\n`;
    }

    return content;
}

// Генерация одного проекта
function generateProjectFile(project) {
    const slug = generateSlug(project.id);
    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);

    // Найти технологии для проекта
    // Это упрощённая версия - в реальности нужно читать technologies.json
    const projectTechs = [];

    const frontMatter = generateFrontMatter(project);
    const markdownContent = generateMarkdownContent(project, projectTechs);

    const fullContent = frontMatter + markdownContent;

    fs.writeFileSync(filePath, fullContent, 'utf8');

    return {
        id: project.id,
        title: project.title,
        path: filePath,
        url: `/projects/${slug}/`
    };
}

// Основная функция
function main() {

    // Проверка существования директории
    if (!fs.existsSync(PROJECTS_DIR)) {
        fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    }

    // Чтение данных
    const data = readProjectsData();
    const projects = data.projects || [];


    // Очистка старых файлов (опционально)
    const existingFiles = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.md'));
    if (existingFiles.length > 0) {
        existingFiles.forEach(file => {
            fs.unlinkSync(path.join(PROJECTS_DIR, file));
        });
    }

    // Генерация файлов
    const generated = [];
    projects.forEach(project => {
        const result = generateProjectFile(project);
        generated.push(result);
    });
}

// Запуск
main();