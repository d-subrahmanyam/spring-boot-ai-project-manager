# Quick Start Guide - Spring Boot Project Manager

## 🚀 Quick Commands

### First Time Setup
```bash
# Clone and build everything
git clone <repository-url>
cd spring-boot-project-manager
mvn clean install
```

### Development Mode (Recommended)
```bash
# Option 1: Use the helper script (Windows)
dev.bat

# Option 2: Manual (two terminals)
# Terminal 1 - Backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd src/main/frontend
yarn dev
```

### Production Build
```bash
# Option 1: Use the helper script (Windows)
build.bat

# Option 2: Manual
mvn clean package

# Run the JAR
java -jar target/spring-boot-project-manager-0.0.1-SNAPSHOT.jar
```

## 📁 Key Files & Locations

### Configuration
| File | Purpose |
|------|---------|
| `pom.xml` | Maven configuration with frontend plugin |
| `src/main/frontend/package.json` | Frontend dependencies |
| `src/main/frontend/vite.config.ts` | Vite build configuration |
| `src/main/frontend/tsconfig.json` | TypeScript configuration |
| `src/main/resources/application.yaml` | Spring Boot configuration |

### Frontend Source
| Path | Contains |
|------|----------|
| `src/main/frontend/src/components/` | Reusable React components |
| `src/main/frontend/src/pages/` | Page components (routes) |
| `src/main/frontend/src/store/` | Redux store, actions, reducers, sagas |
| `src/main/frontend/src/App.tsx` | Root component with routing |
| `src/main/frontend/src/main.tsx` | Application entry point |

### Build Output
| Path | Contains |
|------|----------|
| `src/main/resources/static/` | Frontend production build |
| `target/` | Maven build output and JAR file |

## 🌐 Default URLs

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | http://localhost:3000 | http://localhost:8080 |
| Backend API | http://localhost:8080 | http://localhost:8080 |
| Database | localhost:5432 | (configured in application.yaml) |

## 🎯 Common Tasks

### Add a New Frontend Dependency
```bash
cd src/main/frontend
yarn add <package-name>
```

### Add a New Backend Dependency
Edit `pom.xml` and add dependency, then:
```bash
mvn clean install
```

### Rebuild Frontend Only
```bash
cd src/main/frontend
yarn build
```

### Clean Everything
```bash
mvn clean
cd src/main/frontend
rm -rf node_modules
yarn install
```

## 🔍 Project Structure Overview

```
spring-boot-project-manager/
│
├── src/main/
│   ├── java/                          # Backend code
│   ├── resources/
│   │   ├── application.yaml           # Backend config
│   │   └── static/                    # Frontend build output ⚡
│   └── frontend/                      # Frontend source 📦
│       ├── src/
│       │   ├── components/            # React components
│       │   ├── pages/                 # Route pages
│       │   ├── store/                 # Redux store
│       │   ├── App.tsx                # Root component
│       │   └── main.tsx               # Entry point
│       ├── package.json               # Dependencies
│       ├── vite.config.ts             # Vite config
│       └── tsconfig.json              # TypeScript config
│
├── pom.xml                            # Maven config
├── README.md                          # Main documentation
├── FRONTEND_FEATURES.md               # Feature list
├── start.bat                          # Quick start script
├── dev.bat                            # Dev mode script
└── build.bat                          # Build script
```

## 📝 Key Components

### Pages
- **Dashboard** (`/`) - Overview with stats and samples
- **Projects** (`/projects`) - Project management
- **Notes** (`/notes`) - Note-taking with markdown editor

### Components
- **Layout** - App navigation and structure
- **MarkdownEditor** - Rich text editor for notes
- **MarkdownShowcase** - Demo of markdown features
- **SampleCard** - Example component

## 🛠️ Development Workflow

### Making Changes to Frontend
1. Make changes in `src/main/frontend/src/`
2. Changes auto-reload in dev mode (`yarn dev`)
3. Test in browser
4. Build: `yarn build`
5. Verify in production mode

### Making Changes to Backend
1. Make changes in `src/main/java/`
2. Spring Boot DevTools auto-reloads
3. Test API endpoints
4. Run tests: `mvn test`

### Full Integration Test
1. Build everything: `mvn clean package`
2. Run JAR: `java -jar target/*.jar`
3. Test at http://localhost:8080

## 🐛 Troubleshooting

### Frontend won't build
```bash
cd src/main/frontend
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### Port already in use
Edit port in:
- Backend: `src/main/resources/application.yaml`
- Frontend dev: `src/main/frontend/vite.config.ts`

### Maven can't find Node/Yarn
```bash
mvn clean
rm -rf target
mvn clean install
```

### Changes not showing up
- Dev mode: Check if dev server is running
- Prod mode: Rebuild with `yarn build`
- Clear browser cache

## 📚 Technologies Used

### Frontend Stack
- ⚛️ **React 18** - UI framework
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🔄 **Redux + Redux-Saga** - State management
- 🎨 **Material-UI** - UI components
- 🦸 **Heroicons** - Icons
- 📝 **@uiw/react-md-editor** - Markdown editor

### Backend Stack
- ☕ **Java 21**
- 🍃 **Spring Boot 4.0.2**
- 🤖 **Spring AI**
- 🐘 **PostgreSQL**

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Material-UI](https://mui.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Spring Boot](https://spring.io/projects/spring-boot)

## ✨ Quick Tips

1. **Use dev mode** for faster development
2. **TypeScript errors** show in IDE and terminal
3. **Hot reload** works in dev mode (port 3000)
4. **Build first** before running production JAR
5. **Check console** for API errors in browser DevTools

## 🎉 You're Ready!

Start with:
```bash
# Development
dev.bat

# Or production
build.bat
```

Visit http://localhost:3000 (dev) or http://localhost:8080 (prod)

Enjoy coding! 🚀
