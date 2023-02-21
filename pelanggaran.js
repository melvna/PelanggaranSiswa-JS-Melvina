const express = require("express")
const router = express.Router()
const multer = require("multer") // untuk upload file
const path = require("path") // untuk memanggil path direktori
const fs = require("fs") // untuk manajemen file
const db = require("./db")

const app = express()
app.use(express.static(__dirname));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // set file storage
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        // generate file name 
        cb(null, "melvina-"+ Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({storage: storage})

router.get("/pelanggaran", (req, res) => {
    let sql = "select * from pelanggaran"

    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message 
            }            
        } else {
            response = {
                count: result.length, 
                pelanggaran: result 
            }            
        }
        res.json(response)
    })
})

router.get("/pelanggaran/:id_pelanggaran", (req, res) => {
    let data = {
        id_pelanggaran: req.params.id_pelanggaran
    }
    let sql = "select * from pelanggaran where ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message 
            }            
        } else {
            response = {
                count: result.length, 
                pelanggaran: result 
            }            
        }
        res.json(response) 
    })
})

// router.post("/pelanggaran", (req,res) => {
//     let data = {
//         nama_pelanggaran: req.body.nama_pelanggaran,
//         poin: req.body.poin,
//     }

//     let sql = "insert into pelanggaran set ?"

//     db.query(sql, data, (error, result) => {
//         let response = null
//         if (error) {
//             response = {
//                 message: error.message
//             }
//         } else {
//             response = {
//                 message: result.affectedRows + " data inserted"
//             }
//         }
//         res.json(response) 
//     })
// })

router.post("/pelanggaran", upload.single("image"), (req, res) => {
    let data = {
        nama_pelanggaran: req.body.nama_pelanggaran,
        poin: req.body.poin,
        image: req.file.filename
    }

    if (!req.file) {
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        let sql = "insert into pelanggaran set ?"

        db.query(sql, data, (error, result) => {
            if(error) throw error
            res.json({
                message: result.affectedRows + " data berhasil disimpan"
            })
        })
    }
})

// router.put("/pelanggaran", (req,res) => {
//     let data = [
//         {
//         nama_pelanggaran: req.body.nama_pelanggaran,
//         poin: req.body.poin,
//         },

//         {
//             id_pelanggaran: req.body.id_pelanggaran,
//         }
//     ]
//     let sql = "update pelanggaran set ? where ?"

//     db.query(sql, data, (error, result) => {
//         let response = null
//         if (error) {
//             response = {
//                 message: error.message
//             }
//         } else {
//             response = {
//                 message: result.affectedRows + " data updated"
//             }
//         }
//         res.json(response)
//     })
// })

router.put("/pelanggaran", upload.single("image"), (req,res) => {
    let data = null, sql = null
    let param = { id_pelanggaran: req.body.id_pelanggaran }

    if (!req.file) {
        data = {
        nama_pelanggaran: req.body.nama_pelanggaran,
        poin: req.body.poin,
        }
    } else {
        data = {
        nama_pelanggaran: req.body.nama_pelanggaran,
        poin: req.body.poin,
        image: req.file.filename
        }

        sql = "select * from pelanggaran where ?"
        db.query(sql, param, (err, result) => {
            if (err) throw err
            let fileName = result[0].image

            let dir = path.join(__dirname,"image",fileName)
            fs.unlink(dir, (error) => {})
        })

    }

    sql = "update pelanggaran set ? where ?"

    db.query(sql, [data,param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
})


// router.delete("/pelanggaran/:id", (req,res) => {
//     let data = {
//         id_pelanggaran: req.params.id
//     }
//     let sql = "delete from pelanggaran where ?"

//     db.query(sql, data, (error, result) => {
//         let response = null
//         if (error) {
//             response = {
//                 message: error.message
//             }
//         } else {
//             response = {
//                 message: result.affectedRows + " data deleted"
//             }
//         }
//         res.json(response)
//     })
// })

router.delete("/pelanggaran/:id_pelanggaran", (req,res) => {
    let param = {id_pelanggaran: req.params.id_pelanggaran}

    let sql = "select * from pelanggaran where ?"
    db.query(sql, param, (error, result) => {
        if (error) throw error

        let fileName = result[0].image

        let dir = path.join(__dirname,"image",fileName)
        fs.unlink(dir, (error) => {})
    })

    sql = "delete from pelanggaran where ?"

    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }      
    })
})

module.exports = router