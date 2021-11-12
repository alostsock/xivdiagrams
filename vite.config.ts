import { defineConfig } from 'vite';
import tsconfigpaths from 'vite-tsconfig-paths';
import reactRefresh from '@vitejs/plugin-react-refresh';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tsconfigpaths(), reactRefresh()],
	build: {
		outDir: 'build',
	},
	server: {
		open: false,
	},
});
