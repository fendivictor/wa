const wa = require('@open-wa/wa-automate');
const mysql = require('mysql');
const cron = require('node-cron');

let connect = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "kurir"
});

wa.create()
.then(async function(client) {
    cron.schedule('20 * * * * *', function() {
        scheduler(client);
    });
})
.catch(function(err) {
    console.log(err);
});

function scheduler(client) {
    connect.getConnection(function(err, connection) {
        if (err) console.log(err);
        connection.query("SELECT * FROM tb_outbox WHERE send = 0 ORDER BY insert_at DESC LIMIT 1", async function(err, result, fields) {
            if (result) {
                for (i in result) {
                    await client.sendText(result[i].nomor + '@c.us', result[i].pesan);
                    
                    connection.query("UPDATE tb_outbox SET send = 1 WHERE id = " + result[i].id, function (err, result, fields) {
                  	    connection.release();
                    });
                    
                }
            }
            console.log(result);
        });
    })
}