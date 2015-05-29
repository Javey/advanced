<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>App1</title>
</head>
<body>
    Index
    <script src="/static/jquery.js" type="text/javascript"></script>
    <script type="text/javascript">
        $.ajax({
            url: 'user',
            dateType: 'json',
            type: 'post',
            data: {
                a: 'a',
                b: 'b'
            }
        }).done(function(data) {
            console.log(data);
        })
    </script>
</body>
</html>