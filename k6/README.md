# 自定义K6镜像

主要是为了解决默认K6镜像中，缺失插件的问题，比如`xk6-influxdb`，`xk6-prometheus`等。

## 代码变更

如果需要对插件的代码进行修改。

1. [安装go及xk6](https://github.com/grafana/xk6?tab=readme-ov-file#local-installation).
1. Clone某插件代码到与本项目平行的位置，如[timestream-output](https://github.com/leonyork/xk6-output-timestream)，在这里做本地的代码修改。
1. 运行命令以下命令，重新编译k6到本地`./bin`目录下
   ```shell
   xk6 build --with github.com/leonyork/xk6-output-timestream@latest=$(pwd)/../xk6-output-timestream --output ./bin/k6
   ```

可以在`./bin`目录下找到自定义的K6二进制文件，并使用它进行本地测试：
```shell
 ./bin/k6 run -o timestream  \
  -e K6_TIMESTREAM_DATABASE_NAME='ipay_timestream_db1' \
  -e K6_TIMESTREAM_TABLE_NAME='load-test' - < ./scripts/max-vu.js
```
