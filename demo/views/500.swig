<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>advance-demo</title>
    <link type="text/css" rel="stylesheet" href="/static/css/test.css">
</head>
<body>
{% if env == 'development' %}
    <pre>
        {{ err.stack }}
    </pre>
{% else %}
    <h1>Something broke!</h1>
{% endif %}
</body>
</html>