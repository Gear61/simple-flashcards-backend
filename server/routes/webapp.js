module.exports =  function getWebClient(app) {
    app.get('/', async (req, res) => {
        const protocol = req.secure ? 'https://' : 'http://';
        const hostname = req.get('host');
        res.status(200).render('index', {
            domainUrl: protocol + hostname,
        }); 
    });
}