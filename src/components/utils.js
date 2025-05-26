    /**
     * 把 Uint8Array 二进制数据解析成 JSON 对象数组
     * @param {Uint8Array} data
     * @param {Number} sheetIndex 默认为第 0 个表
     * @returns {Array<Object>}
     */
    export function parseArrayBuffer(data, sheetIndex = 0) {
      const workbook = XLSX.read(data, { type: 'array' });
      const name = workbook.SheetNames[sheetIndex];
      const sheet = workbook.Sheets[name];
      return XLSX.utils.sheet_to_json(sheet, { defval: '' });
    }

    /**
     * 从本地 File 对象读取并解析
     * @param {File} file
     * @returns {Promise<Array<Object>>}
     */
    export function readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          try {
            resolve(parseArrayBuffer(data));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
      });
    }

        /**
     * 获取指定字段（条目）下的所有数据，空值用 0 填充
     * @param {Array<Object>} dataArray
     * @param {string} field - 要提取的字段名
     * @returns {Array<*>} - 对应字段的值数组，空、undefined 或 null 的位置替换为 0
     */
    export function getColumn(dataArray, field) {
      return dataArray.map(item => {
        const v = item[field];
        return (v === undefined || v === null || v === '') ? 0 : v;
      });
    }

    /**
     * 按指定字段和值进行筛选
     * @param {Array<Object>} dataArray
     * @param {string} field - 要匹配的字段名
     * @param {*} value - 目标值相等
     * @returns {Array<Object>} - 匹配成功的对象数组
     */
    export function filterByFieldValue(dataArray, field, value) {
      return dataArray.filter(item => item[field] === value);
    }


    // 绑定文件输入事件
    /*
    document.getElementById('fileInput').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      const output = document.getElementById('output');
      if (!file) return;
      output.textContent = '正在读取...';
      try {
        const json = await readFile(file);
        output.textContent = JSON.stringify(json, null, 2);

        const rev = getColumn(json, 'rev_bis');
        console.log( rev);

        const rev_bis = filterByFieldValue(json, 'rev_bis', 'Rev');
        console.log(rev_bis);

        
      } catch (err) {
        output.textContent = '解析失败：' + err.message;
      }
    });
*/
