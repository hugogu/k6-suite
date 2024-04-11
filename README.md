# 压力测试工具包

## 前置条件

* 安装[Docker Desktop](https://www.docker.com/products/docker-desktop/)
* 安装[Docker Compose](https://docs.docker.com/compose/install/)

## 使用步骤

1. 开启VPN
1. 构建附加插件的镜像
    ```shell
    docker build --build-arg PLUGIN=grafana/xk6-output-influxdb -t load-test-k6-influxdb ./k6
    docker build --build-arg PLUGIN=leonyork/xk6-output-timestream -t load-test-k6-timestream ./k6
    ```
1. 启动相关服务
    ```shell
    docker-compose up -d
    ```
1. 根据需要，配置测试脚本【跑示例可跳过】
    * 参考`./scripts/max-vu.js`
    * 将自己测试脚本放置在`./scripts`目录下
1. 执行测试
   * 基于InfluxDB
    ```shell
    docker run --network="host" --rm -i load-test-k6-influxdb run -o xk6-influxdb \
        -e K6_INFLUXDB_ORGANIZATION='HG' \
        -e K6_INFLUXDB_BUCKET='k6' -e K6_INFLUXDB_TOKEN='secret_token' - < ./scripts/max-vu.js
    ```
   * 基于Prometheus，参考[Prometheus remote write](https://grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/)
    ```shell
    docker run --network="host" --rm -i grafana/k6 run -o experimental-prometheus-rw \
        --tag testid=hello-app \
        -e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
        -e K6_PROMETHEUS_RW_TREND_STATS='p(95),p(99),min,max' - < ./scripts/max-vu.js
    ```
   * 基于Amazon Timestream :flag: 需要自己先在AWS上创建访问密钥，然后配置到`.env`文件中。 
     :warning: 仅 0.9 之后的版本支持。相关Issue：https://github.com/leonyork/xk6-output-timestream/issues/260
    ```shell
    source .env
    docker run --network="host" --rm -e K6_TIMESTREAM_DATABASE_NAME -e K6_TIMESTREAM_TABLE_NAME \
       -e K6_TIMESTREAM_REGION -e AWS_REGION -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY \
       -i load-test-k6-timestream run -o timestream - < ./scripts/max-vu.js
    ```
1. 查看测试结果
    * 通过[内置面板](http://localhost:3000/d/dba00ead-0f0a-4c1d-a3f6-505d886ab946/k6-built-in-load-testing-results?orgId=1&refresh=5s)访问测试结果
       * 直接访问Prometheus: http://localhost:9090
       * 直接访问InfluxDB: http://localhost:8086
    * 【可选】从Grafana导入新面板
      * [K6-Prometheus面板](https://grafana.com/grafana/dashboards/19665-k6-prometheus/)
      * [K6 Load Testing Result面板](https://grafana.com/grafana/dashboards/2587-k6-load-testing-results/)

## 参考资料

* [K6](https://k6.io/) 及其[文档](https://grafana.com/docs/k6/latest/) 
* [Prometheus写入API](https://prometheus.io/docs/prometheus/latest/storage/#overview)
* [K6 Build Script](https://github.com/grafana/xk6)
* [InfluxDB文档](https://docs.influxdata.com/influxdb/v2/reference/api/influxdb-1x/dbrp/#when-creating-a-bucket)
