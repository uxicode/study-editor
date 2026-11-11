import { resolve } from 'path'
import { configureSqlWasm } from '@/lib/sql-engine'

// Node 테스트에서는 브라우저용 ?url 대신 node_modules 의 wasm 파일을 직접 사용한다.
configureSqlWasm(() => resolve(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm'))
