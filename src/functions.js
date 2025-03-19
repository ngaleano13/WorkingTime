const { exec } = require('child_process');

function listarProcesos(callback) {
  exec('tasklist', (error, stdout, stderr) => {
    if (error) {
      callback(null, error.message);
      return;
    }

    const procesos = stdout.split('\n').slice(3).map(line => {
      const columns = line.trim().split(/\s+/);

      if (columns.length < 5) return null;

      return {
        nombre: columns[0],
        pid: columns[1],
      };
    }).filter(proceso => proceso); 

    callback(procesos);
  });
}

module.exports = {
  listarProcesos,
};
