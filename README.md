# 摘要
课后学习是大学学习中很重要的一部分。在课堂上，由于时间所限，老师可能有一些遗漏的地方，而学生当场往往无法很好地理会老师的意思，在课后又苦于没有合适的平台来进行课后复习与资料下载，学生和老师之间缺乏**沟通交流、答疑解惑、共享资料**的平台。从这一需求出发，结合新兴的Node.js技术，为华师师生提供一个课程网站平台**eCourse**。

# 目录
# 引言
1. 前端发展的历史及趋势
    1. Web1.0时期
    2. Web2.0时期
    3. 前后端分离
    4. Node.js
2. Node.js简介
    1. 单线程和异步式I/O
    2. 事件驱动模型
    3. 模块
3. Express框架
    1. 路由控制
    2. 模板引擎
    3. 中间件
4. MongoDB数据库

# 系统设计
1. 用户设计
    1. 教师
    2. 学生
    3. 系统管理员admin
2. 功能设计
    1. 注册
    2. 登陆
    3. 登出
    4. 修改个人资料
    5. 发表、修改、删除课程
    6. 加入、退出课程
    7. 创建、删除留言
    8. 添加、修改、删除课程内容
    9. 上传、删除、下载课件
    10. 上传、删除、下载作业
3. 路由设计
    1. 注册
    2. 登陆
    3. 登出
    4. 修改个人资料
    5. 发表、修改、删除课程
    6. 加入、退出课程
    7. 创建、删除留言
    8. 添加、修改、删除课程内容
    9. 上传、删除、下载课件
    10. 上传、删除、下载作业
4. 模型设计
    1. 用户
    2. 课程
    3. 留言
    4. 课程参与者
    5. 课程内容
    6. 课件
    7. 课程作业
    8. 课程内容留言
5. 页面设计

# 系统实现及关键技术
1. 系统结构
2. 系统启动
    1. 开发模式
    2. 正常模式
3. 配置文件
4. 程序主文件
5. 路由
6. 操作数据库
7. 权限控制
    1. 检测登陆及非登陆状态
    2. 检测是否作者
8. 页面通知
9. 系统日志

# 参考文献
# 附录（附图）
# 致谢

# 引言
1. 前端发展的历史及趋势
    1. Web1.0时期
        Web前端开发是从网页制作演变而来的。在Web1.0时期，网站都是静态的纯内容展示，用户使用网站的行为也以浏览为主，可以拆分为以下过程：后端收到浏览器的请求，生成静态页面，再将静态页面发送到浏览器。在这一时期，前后端开发是一体的，前端代码是后端代码的一部分。
        而这一时期的网站开发，采用的是后端MVC模式，分为以下三层：
        
        * Model（模型层）：提供、保存数据。
        * Controller（控制层）：数据处理，实现业务逻辑。
        * View（视图层）：展示数据，提供用户数据。
        
        此时前端只是后端MVC中的View（视图层），前端工程师实际上是模板工程师，负责编写页面模板。后端代码读取模板，替换变量，从而渲染出页面。
        
    2. Web2.0时期
        后来AJAX技术改变了这一状态，并促成了Web2.0时代的到来。AJAX（Asynchronous Javascript And XML，异步JavaScript和XML）是一种创建交互式网页应用的网页开发技术，通过在后台与服务器进行少量数据交换，可以使网页实现异步刷新，这意味着可以在不加在整个网页的情况下对某部分进行更新。2004年的Gmail和2005年的Google地图使这一技术广泛为开发者所熟知，此时前端不再是后端的模板，而是可以独立得到各种数据。
        在这一时期，网站不再是单纯的静态内容展示，而是动态页面，富交互，并且需要前端进行数据处理。从这时起，前端工程师的工作变得比之前复杂许多，不再像之前一样只需要提供模板交由后端渲染，还需要通过AJAX得到数据、保存数据、进行数据处理并生成视图。
        这一改变也导致了前端MVC框架的诞生，如被广泛使用的Backbone.js将前端代码分为Model（管理数据）和View（展现数据）两个基本部分，去掉了Controller部分，因为前端Controller不需要也不应该处理业务逻辑，只需要处理UI逻辑来响应用户的操作即可。同时前端还可以使用Router（路由），通过URL切换视图。
        另一些框架提出MVVM模式，如Angular.js和Vue.js，用View-Model代替Controller：
        
        * Model
        * View
        * View-Model：简化的Controller，唯一的作用就是为View提供处理好的数据，不含其他逻辑。
        
        这些框架的本质是使用View绑定View-Model，视图与数据模型强耦合。数据的变化实时反应在View上，不需要手动处理。
        此时前端可以做到读写数据、切换视图、用户交互，这意味着网页实际上是一个应用程序（SPA，Single-page Application）。从这以后，前端工程师从开发页面，变成了开发前端应用（跑在浏览器里面的应用程序）。
        
    3. 前后端分离
        前端应用的兴起和智能手机的普及使前端开发方式发生根本的变化，前端不再是后端MVC中的V，而是单独的一层。
        前后端分离以后，它们之间通过接口通信，后端暴露出接口，前端消费后端提供的接口。后端接口一般是REST形式，前后端的通信协议一般是HTTP。
        
    4. Node.js
        2009年，Node.js诞生，它是服务器上的JavaScript运行环境+操作系统API。
        这也意味着，JavaScript与Python和Ruby一样，成为服务器脚本语言，并且JavaScript成为唯一的在浏览器端和服务器端都能运行的语言，更重要的是，前端工程师可以编写后端程序了。
        同时，前端开发模式发生根本改变，前端工程师在Node.js环境下开发，大量使用服务器端工具，并引入持续集成等软件工程的标准流程。前端工程师正在转变为全栈工程师，可以一个人负责前端和后端、从数据库到UI的所有开发。
        
2. Node.js简介
    > Node.js是一个让JavaScript运行在服务器端的平台。它可以让JavaScript脱离服务器的束缚运行在一般的服务器环境下，就像运行Python、Perl、PHP、Ruby程序一样。——《Node.js开发指南》第一章

    Node.js是一个基于Chrome JavaScript运行时（runtime）建立的平台，实际上是对Google V8引擎进行封装，V8号称是目前世界上最快的JavaScript引擎，因而它的执行速度非常快，接近本地代码的执行速度。Node.js使用**单线程、非阻塞I/O（异步式I/O）和事件驱动模型**，因而非常轻量和高效，非常适合在分布式设备上运行数据密集型的实时应用。
    1. 单线程和异步式I/O
        对于高并发的解决方案，传统的架构是多线程模型，也就是为每个业务逻辑提供一个系统线程，通过系统线程切换来弥补同步式I/O调用时的时间开销。Node.js使用的是单线程模型，对于所有I/O都采用异步式的请求方式，避免了频繁的上下文切换，在执行过程中会维护一个时间队列，程序在执行时进入事件循环等待下一个事件到来，每个异步式I/O请求完成后会被推送到事件队列，等待程序进程进行处理。
    2. 事件驱动模型
        Node.js进程在同一时刻只会处理一个事件，完成后立即进入事件循环检查并处理后面的事件，这样做的好处是CPU和内存在同一时间集中处理一件事，同时尽可能让耗时的I/O操作并行执行。对于低速连接攻击，Node.js知识在事件队列中增加请求，等待操作系统的回应，因而不会有任何多线程开销，很大程度上可以提高Web应用的健壮性，防止恶意攻击。
    3. 模块
        Node.js使用Module模块去划分不同的功能，模块中包含了很多功能代码片段，在模块中的代码大部分都是私有的，也就是说模块中定义的函数方法和变量都只能在该模块中被调用，不过可以使用exports对象将某些方法和变量暴露到模块外，供模块外程序调用。
        Node.js使用npm（Node包管理工具）来进行第三方包管理，它是一个完全由JavaScript实现的命令行工具，通过Node.js执行。
        
3. Express框架
    > Express是一个精简的、灵活的Node.js Web程序框架，为构建单页、多页及混合的Web程序提供了一系列健壮的功能特性。——Express网站
    
    Express是目前最稳定、使用最广泛，而且Node.js官方推荐的唯一一个Web开发框架，它除了为http模块提供了更高层的接口外，还实现了路由控制、模板解析、动态视图、中间件支持等功能。
    1. 路由控制
        Express通过解析请求的路径来调用不同的控制器来处理请求，然后访问模板引擎生成HTML页面，最后由控制器将HTML页面返回给浏览器，完成一次请求。
        Express支持REST（Representational State Transfer，表征状态转移）风格的请求方式，它是一种基于HTTP协议的网络应用的接口风格，充分利用HTTP的方法实现统一风格接口的服务。HTTP协议定义了以下8种标准的方法：
        
        * GET：请求获取指定资源。
        * HEAD：请求指定资源的相应头。
        * POST：向指定资源提交数据。
        * PUT：请求服务器存储一个资源。
        * DELETE：请求服务器删除指定资源。
        * TRACE：回显服务器收到的请求，主要用于测试或诊断。
        * CONNECT：HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器。
        * OPTIONS：返回服务器支持的HTTP请求方法。
        
        其中经常用到的是GET、POST、PUT和DELETE方法，根据REST设计模式，它们通常用于实现获取、新增、更新、删除4种功能。
    2. 模板引擎
        模板引擎是一个将页面模板和数据结合起来生成HTML的工具。早期的ASP、JSP等模板引擎将功能逻辑嵌入到模板中，运行时动态生成HTML页面，这样会导致功能逻辑与布局样式耦合、逻辑划分困难，不利于网站日后的维护。
        而现代的模板引擎是MVC的一部分，在功能划分上它严格属于视图部分，因此功能以生成HTML页面为核心，不会引入过多的编程语言的功能。在MVC架构中模板引擎包含在服务器端，控制器得到用户请求后从模型获取数据，调用模板引擎。模板引擎将模板和数据结合起来，生成HTML页面，然后返回给控制器，由控制器交回客户端。
    3. 中间件
        > 中间件（Middleware）是一个函数，它可以访问请求对象（request object，req）, 响应对象（response object，res）, 和web应用中处于请求-响应循环流程中的中间件，一般被命名为next的变量。——Express网站
        
        Express是一个自身功能极简，完全是由路由和中间件构成的一个web开发框架，从本质上说一个Express应用就是在调用各种中间件。
        中间件的功能包括：
        
        * 执行任何代码。
        * 修改请求和响应对象。
        * 终结请求-响应循环。
        * 调用堆栈中的下一个中间件。
        
        如果当前中间件没有终结请求-响应循环，则必须调用next()方法将控制权交给下一个中间件，否则请求就会挂起。
        
4. MongoDB数据库
    > 两种最流行的NoSQL数据库是文档数据库和键—值数据库。文档数据库善于存储对象，这使得它们非常适合Node.js和JavaScript。键—值数据库如其名所示，对于数据模式可以轻松映射到键—值对的程序来说是很好的选择。文档数据库代表了关系型数据库的限制和键—值数据库的简单性两者之间的最佳折中。——《Node与Express开发》第十三章
    
    MongoDB是一个基于分布式文件存储的文档数据库，属于NoSQL数据库（Not Only SQL，非关系数据库）。MongoDB由数据库、集合、文档、域、索引和主键组成，其中集合类似于关系数据库中的数据库表，文档类似于数据记录行，域则类似于数据字段。MongoDB将数据存储为一个文档，文档是一个键值(key-value)对（即BSON），类似于JSON对象，字段值可以包含其他文档，数组及文档数组。文档不需要设置相同的字段，并且相同的字段不需要相同的数据类型，这与关系型数据库有很大的区别，也是MongoDB非常突出的特点。

# 系统设计
1. 用户设计
    eCourse共有三类用户：
    1. 教师
        教师用户拥有发表课程和发表评论、添加课程内容、上传课件的权限，无加入课程的权限。
    2. 学生
        学生用户拥有加入课程和发表评论、上传作业的权限，无发表课程的权限。
    3. 系统管理员admin
        系统管理员只拥有审核课程的权限，课程发表后须经过系统管理员审核后才能加入、评论和添加课程内容。
    其中教师用户和学生用户通过注册用户获得，系统管理员则由系统后台自动创建。
    
2. 功能设计
    eCourse是一个面向华师师生的课程网站，供教师发布课程、向学生答疑解惑、共享课件，学生复习课程内容、与教师交流、下载课件。故应有如下几个功能：
    1. 注册
        教师使用工号注册，学生使用学号注册，以此作为用户名，均为纯数字，不可重复。注册需填写用户名、密码、姓名、身份（教师或学生）、学院、邮箱、个人简介和上传头像。
    2. 登陆
        用户使用用户名和密码登陆系统。
    3. 登出
        已登陆的用户可以通过登出功能来退出登陆。
    4. 修改个人资料
        用户可以修改注册时填写的姓名、密码、邮箱、个人简介和头像，用户名、身份、学院无法修改。
    5. 发表、修改、删除课程
        只有教师用户拥有发表课程的权限，课程发表后须经过系统管理员审核后才能加入、评论和添加课程内容。发表该课程的教师用户有权限修改和删除该课程。
    6. 加入、退出课程
        只有学生用户拥有加入课程的权限，每个学生只能加入同一个课程一次。已经加入课程的学生用户可以退出该课程。
    7. 创建、删除留言
        已登陆用户可以在课程页最下方进行留言。该留言的作者可以删除自己的留言。
    8. 添加、修改、删除课程内容
        发表该课程的教师用户可以添加、修改、删除课程内容。
    9. 上传、删除、下载课件
        发表该课程的教师用户可以在课程内容页上传、删除课件，课件格式必须为ppt、doc、pdf、txt、rar或zip，大小最大为10M。只有加入该课程的学生用户才能下载课件。
    10. 上传、删除、下载作业
        学生用户可以在课程内容页上传、删除作业，作业格式必须为ppt、doc、pdf、txt、rar或zip，大小最大为10M。只有发布该课程的教师用户才能浏览并下载作业。
        
3. 路由设计
    1. 注册
        1. 注册页：GET /signup
        2. 注册：POST /signup
    2. 登陆
        1. 登陆页：GET /signin
        2. 登陆：POST /signin
    3. 登出
        1. 登出：GET /signout
    4. 修改个人资料
        1. 个人资料页：GET /user/:userId
        2. 修改个人信息页：GET /user/:userId/edit
        3. 修改个人信息：POST /user/:userId/edit
        4. 修改密码页：GET /user/:userId/modifypwd
        5. 修改密码：POST /user/:userId/modifypwd
        6. 修改头像：POST /user/:userId/avatar
    5. 发表、修改、删除课程
        1. 发布课程页：GET /course/create
        2. 发布课程：POST /course/create
        3. 课程页：GET /course/:courseId
        4. 删除课程：GET /course/:courseId/remove
        5. 修改课程页：GET /course/create
        6. 修改课程：POST /course/create
    6. 加入、退出课程
        1. 加入课程：POST /course/:courseId/attend
        2. 退出课程：GET /course/:courseId/attend/:attendId/remove
    7. 创建、删除留言
        1. 创建留言：POST /course/:courseId/comment
        2. 删除留言：GET /course/:courseId/comment/:commentId/remove
    8. 添加、修改、删除课程内容
        1. 添加课程内容页：GET /course/:courseId/lesson
        2. 添加课程内容：POST /course/:courseId/lesson
        3. 课程内容页：GET /course/:courseId/lesson/:lessonId
        4. 删除课程内容：GET /course/:courseId/lesson/:lessonId/remove
        5. 修改课程内容页：GET /course/:courseId/lesson/:lessonId/edit
        6. 修改课程内容：POST /course/:courseId/lesson/:lessonId/edit
    9. 上传、删除、下载课件
        1. 上传课件：POST /course/:courseId/lesson/:lessonId/cozware
        2. 删除课件：GET /course/:courseId/lesson/:lessonId/cozware/:cozwareId/remove
        3. 下载课件：GET /course/file/:filename
    10. 上传、删除、下载作业
        1. 上传作业：POST /course/:courseId/lesson/:lessonId/lessonhwk
        2. 删除作业：GET /course/:courseId/lesson/:lessonId/lessonhwk/:lessonhwkId/remove
        3. 下载作业：GET /course/file/:filename

4. 模型设计
    1. 用户
        用户文档存储用户名、密码、姓名、身份、学院、头像、邮箱、个人简介字段。
        ```
        exports.User = mongolass.model('User', {
          name: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' },
          avatar: { type: 'string' },
          identity: { type: 'string', enum: ['student', 'teacher', 'admin'] },
          school: { type: 'string' },
          bio: { type: 'string' },
          email: { type: 'string' }
        });
        ```
    2. 课程
        课程文档存储课程作者id、课程名、课程内容、课程类型、浏览数、评论数、参与数和课程审核状态字段。
        ```
        exports.Course = mongolass.model('Course', {
          author: { type: Mongolass.Types.ObjectId },
          title: { type: 'string' },
          content: { type: 'string' },
          type: { type: 'string' },
          pv: { type: 'number' },   // 浏览数
          cmt: { type: 'number' },  // 评论数
          atd: { type: 'number' },  // 参与数
          status: { type: 'string' }// 课程状态：0未审核，1已审核，2已删除
        });
        ```
    3. 留言
        留言文档存储课程id、留言作者id和留言内容字段。
        ```
        exports.Comment = mongolass.model('Comment', {
          courseId: { type: Mongolass.Types.ObjectId },
          author: { type: Mongolass.Types.ObjectId },
          content: { type: 'string' }
        });
        ```
    4. 课程参与者
        课程参与表存储课程id、课程作者id及参与者id字段。
        ```
        exports.Attender = mongolass.model('Attender', {
          courseId: { type: Mongolass.Types.ObjectId },
          author: { type: Mongolass.Types.ObjectId },
          attender: { type: Mongolass.Types.ObjectId }
        });
        ```
    5. 课程内容
        课程内容表存储课程id、课程作者id、课时、课程内容标题及课程内容字段。
        ```
        exports.Lesson = mongolass.model('Lesson', {
          courseId: { type: Mongolass.Types.ObjectId },
          author: { type: Mongolass.Types.ObjectId },
          order: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' }
        });
        ```
    6. 课件
        课件文档存储课程内容id、课程id、课程作者id、课件路径与课件名字段。
        ```
        exports.Cozware = mongolass.model('Cozware', {
          lessonId: { type: Mongolass.Types.ObjectId },
          courseId: { type: Mongolass.Types.ObjectId },
          author: { type: Mongolass.Types.ObjectId },
          path: { type: 'string' },
          name: { type: 'string' }
        });
        ```
    7. 课程作业
        课程作业文档存储课程内容id、课程id、作者id、作业路径及作业文件名字段。
        ```
        exports.Lessonhwk = mongolass.model('Lessonhwk', {
          lessonId: { type: Mongolass.Types.ObjectId },
          courseId: { type: Mongolass.Types.ObjectId },
          author: { type: Mongolass.Types.ObjectId },
          path: { type: 'string' },
          name: { type: 'string' }
        });
        ```
    8. 课程内容留言
        课程内容留言文档存储课程内容id、课程id、作者id和留言内容字段。
        ```
        exports.Lessoncmt = mongolass.model('Lessoncmt', {
          lessonId: { type: Mongolass.Types.ObjectId },
          courseId: { type: Mongolass.Types.ObjectId },
          author: { type: Mongolass.Types.ObjectId },
          content: { type: 'string' }
        });
        ```
5. 页面设计
    本系统使用`jQuery` + `Semantic-UI`实现前端页面的设计，共有以下几个页面：
    
    * 注册页
    * 登陆页
    * 用户个人主页
    * 课程页
    * 发表课程页
    * 编辑课程页
    * 课程内容页
    * 添加课程内容页
    * 编辑课程内容页
    
    本系统使用ejs模板引擎生成HTML页面，将页面分为一个个组件，使用时再组合起来渲染页面，提高代码复用率。
    如课程页分为header、course-content和footer，其中header又分为nav、nav-setting和notification。（放图）

# 系统实现及关键技术
1. 系统结构
    ```
    eCourse
    |-- config              存放配置文件
    |   |-- admin.js        系统管理员admin用户配置
    |   |-- default.js      系统端口、数据库连接及session配置
    |
    |-- lib
    |   |-- mongo.js        数据库文档域配置
    |
    |-- logs                存放系统日志文件
    |   |-- error.log       正常请求
    |   |-- success.log     错误请求
    |
    |-- middlewares         存放中间件
    |   |-- check.js        检测用户登录状态
    |
    |-- models              存放操作数据库的文件
    |   |-- attenders.js    课程参与者
    |   |-- comments.js     课程留言
    |   |-- courses.js      课程
    |   |-- cozwares.js     课件
    |   |-- lessoncmts.js   课程内容留言
    |   |-- lessonhwks.js   课程内容作业
    |   |-- lessons.js      课程内容
    |   |-- users,js        用户
    |
    |-- node_modules        存放npm下载的第三方中间件
    |
    |-- public              存放静态文件
    |   |-- css             css样式文件
    |   |   |-- style.css
    |   |-- js              js文件
    |   |   |-- common.js
    |   |-- upload          用户上传文件目录，存放头像、课件、作业等
    |
    |-- routes              存放路由配置文件
    |   |-- course.js       课程页localhost:3000/course及以下路由
    |   |-- courses.js      首页重定向至localhost:3000/courses
    |   |-- index.js        总配置，分发路由
    |   |-- signin.js       用户登录localhost:3000/signin
    |   |-- signout.js      用户登出localhost:3000/signout
    |   |-- signup.js       用户注册localhost:3000/signup
    |   |-- user.js         用户主页localhost:3000/user/:userId
    |
    |-- views               存放ejs模板
    |   |-- components      模板组件，可复用
    |   |   |-- avatar.ejs
    |   |   |-- nav.ejs
    |   |   |-- nav-setting.ejs
    |   |   |-- notification.ejs
    |   |   |-- usercard.ejs
    |   |   |-- ...
    |   |-- 404.ejs         404页面
    |   |-- course.ejs      课程页
    |   |-- header.ejs  
    |   |-- footer.ejs
    |   |-- signin.ejs      登陆页
    |   |-- signup.ejs      注册页
    |   |-- ...
    |
    |-- index.js            程序主文件
    |-- package.json        程序信息，存储项目名、描述、作者、依赖等等
    |-- startdev.bat        启动程序开发模式
    |-- startup.bat         启动程序
    ```
    
2. 系统启动
    本系统有两种启动方式，分为为开发模式和正常模式，通过startdev和startup批处理文件可以进入对应模式，也可以通过对应命令行进入。
    1. 开发模式
        ```
        startdev.bat
        supervisor --harmony index
        ```
        开发模式使用supervisor中间件来监听当前目录下node和js后缀的文件并定时重启程序，解决改动后台文件后要手动重启服务器才能看到改动的问题。
    2. 正常模式
        ```
        startup.bat
        node index
        ```
        正常模式使用node命令编译程序主文件index.js并启动程序。
        
3. 配置文件
    配置文件default.js中配置系统启动端口、数据库连接及session过期时间。
    ```
    module.exports = {
      port: 3000,
      session: {
        secret: 'eCourse',
        key: 'eCourse',
        maxAge: 1000 * 60 * 60 * 3
      },
      mongodb: 'mongodb://localhost:27017/eCourse'
    };
    ```
    在配置文件中设置系统启动地址为`localhost:3000`，`session`过期时间为3小时，MongoDB地址为`localhost:27017/eCourse`。
    
4. 程序主文件
    程序主文件index.jx中使用require命令引入第三方依赖包，配置好各个中间件并监听端口启动程序。
    ```
    // 设置模板目录
    app.set('views', path.join(__dirname, 'views'));
    // 设置模板引擎为 ejs
    app.set('view engine', 'ejs');
    // 设置静态文件目录
    app.use(express.static(path.join(__dirname, 'public')));
    
    // 监听端口，启动程序
    app.listen(config.port, function () {
      console.log(`${pkg.name} listening on port ${config.port}`);
      admin.init();
    });
    ```

5. 路由
    Express Router通过解析请求的路径来调用不同的控制器来处理请求，然后访问模板引擎生成HTML页面。
    首先通过routes/index.js分配总路由地址：
    ```
    module.exports = function (app) {
      app.get('/', function (req, res) {
        res.redirect('/courses'); // 首页重定向到courses页面
      });
      app.use('/signup', require('./signup'));
      app.use('/signin', require('./signin'));
      app.use('/signout', require('./signout'));
      app.use('/courses', require('./courses'));
      app.use('/course', require('./course'));
      app.use('/user', require('./user'));
    };
    ```
    此处规定访问用户注册页`localhost:3000/signup`由控制器signup.js处理：
    ```
    router.get('/', checkNotLogin, function(req, res, next) {
      res.render('signup', { subtitle: '注册' });
    });
    ```
    控制器接受到来自`localhost:3000/signup`的GET请求后，首先使用中间件check.js检查当前用户是否已经登陆，如未登陆则渲染模板signup.ejs并将subtitle参数传给模板，渲染好的注册页面再由控制器返回给浏览器，此时用户可以看到注册页。
    
6. 操作数据库
    控制器通过引入models文件夹下的js文件来进行数据库操作，如进行用户注册时需检测该用户名是否已经存在，此时调用models/users.js中的方法进行数据库查询：
    ```
    getUserByUsername: function getUserByUsername(username) {
      return User
        .findOne({ username: username })
        .addCreatedAt()
        .exec();
    }
   ```
   用户填写信息无误后创建用户：
   ```
   create: function create(user) {
     return User.create(user).exec();
   }
   ```
        
7. 权限控制
    本系统中使用`Express中间件`来控制用户权限，用户在未登录的情况下无法使用除注册和登陆外的所有功能，而在已登陆的情况下无法进行注册和登陆，并且非课程作者无法修改、删除该课程，非留言作者则无法删除该留言。
    1. 检测登陆及非登陆状态
        ```
        module.exports = {
          checkLogin: function checkLogin(req, res, next) {
            if (!req.session.user) {
              req.flash('error', '未登录'); 
              return res.redirect('/signin');
            }
            next();
          },
        
          checkNotLogin: function checkNotLogin(req, res, next) {
            if (req.session.user) {
              req.flash('error', '已登录'); 
              return res.redirect('back');//返回之前的页面
            }
            next();
          }
        };
        ```
    2. 检测是否作者
        ```
        if(user && author && user._id.toString() !== author.toString()) {
          throw new Error('权限不足');
        }
        ```
8. 页面通知
    本系统中使用`connect-flash`中间件来实现页面通知功能，在用户操作后返回给用户操作成功与否的通知。设置初始值`req.session.flash={}`，通过`req.flash(name, value)`设置这个对象下的字段和值，通过`req.flash(name)`获取这个对象下的值，同时删除这个字段。
    ```
    req.flash('success', '注册成功');
    ```
    
9. 系统日志
    本系统中使用第三方中间件winston来记录系统运行日志，在程序主文件index.js中进行配置，将正常请求的日志记录到logs/success.log文件中，将错误请求的日志记录到logs/error.log文件中：
    ```
    // 正常请求的日志
    app.use(expressWinston.logger({
      transports: [
        new (winston.transports.Console)({
          json: true,
          colorize: true
        }),
        new winston.transports.File({
          filename: 'logs/success.log'
        })
      ]
    }));
    // 路由
    routes(app);
    // 错误请求的日志
    app.use(expressWinston.errorLogger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        }),
        new winston.transports.File({
          filename: 'logs/error.log'
        })
      ]
    }));
    ```

# 参考文献
# 附录（附图）
# 致谢