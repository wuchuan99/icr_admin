# 编码风格指南
  适用于前端项目javascript编码规范

  - [源文件](#源文件)
  - [代码格式](#代码格式)
  - [语言特性](#语言特性)
  - [命名](#命名)
  - [Vue](#vue)
  - [自动化相关](#自动化测试)
  - [相关工具](#相关工具)

## 源文件
- 文件、文件夹名称

    文件名全部小写、可以包含```-```, 但不包含其他标点符号, 多个单词以```-```分割

    ```javascript
    form
    form-item
    global-api
    ```

- 文件编码

    源文件以UTF-8格式编码

## 代码格式
- 大括号

    流程控制语句中(例如: ```if```, ```else```, ```for```, ```do```, ```while```)必须使用大括号

    ```javascript
    if(someCondition()) {
        doSomething()
    }
    
    ```

    不好的: 
    ```javascript
    if(someVeryLongCondition())
        doSomething()

    for (let i = 0; i < foo.length; i++) bar(foo[i]);
    ```

    特例: 简单的if语句没有换行, 来提高可读性时，可以忽略大括号

    ```javascript
    if (shortCondition()) foo();
    ```

- 代码块缩进: +2空格
    
    代码块及换行以2空格进行缩进, 缩进同时适用于代码及注释
    
- 代码块注释

    代码块注释与所注释代码块缩进一致, 可以是 ```/* ... */```或者 ```//```

    ```javascript
    /*
    * This is
    * okay.
    */

    // And so
    // is this.

    /* This is fine, too. */
    ```    

- 函数注释
  
  基本格式如下: 
  ```javascript
  /**
  * Multiple lines of desc text are written here,
  * wrapped normally.
  * @param {number} arg1 A number to do something to.
  * @param {number} arg2 A number to do something to.
  * @return {number} return value
  */
  function doSomething(arg1, arg2) { … }
  ```
  更多参考 [jsdoc](https://jsdoc.app/)

- 参数注释
  
  参数注释适用在参数值或方法名称不能准确描述其含义时适用
    ```javascript
    someFunction(obviousParam, /* shouldRender= */ true, /* name= */ 'hello');

    someFunction(obviousParam, true /* shouldRender */, 'hello' /* name */);
    ```    
    
## 语言特性
- 局部变量声明

    所有变量声明适用```const```或者```let```, 默认使用```const```, 除非变量需要重新赋值. 不使用```var```来声明.

- 嵌套函数与闭包
  
    函数可能包含嵌套函数定义, 如果嵌套函数是具名函数, 应将其分配为本地常量

- 箭头函数

    箭头函数提供了简洁的函数语法及简化嵌套函数中的```this```指向, 相比于```function```关键字, 应优先使用箭头函数, 尤其是在一些嵌套函数的使用中

- 字符串
  
    常规字符串使用使用单引号```'```分割, 而不是双引号```"```

- 数字
  
    数字可以指定为十进制、十六进制、八进制或二进制, 分别使用小写字母 0x、0o 和 0b 前缀表示十六进制、八进制和二进制
    
- 异常
  
    总是抛出```Error```或的```Error```子类: 永远不要抛出字符串文字或其他对象, 构造```Error```时始终使用 new关键字  

- 空```catch```块

    对捕获的异常不做任何处理是十分少见的, 如果在 catch 块中不采取任何行动确实是合适的，那么在评论中解释了这样做的理由

    ```javascript
    try {
        return handleNumericResponse(response);
    } catch (ok) {
        // it's not numeric; that's fine, just continue
    }
    return handleTextResponse(response);
    ``` 

    不好的:
    ```javascript
    try {
        shouldFail();
        fail('expected an error');
    } catch (expected) {
    }
    ```
- ```with```

    不要使用 ```with``` 关键字。它使代码更难理解，并且自 ES5 以来已在严格模式下被禁止

- 动态代码执行
  
    不要使用 ```eval``` 或 ```Function(...string)``` 构造函数

## 命名
- 通用规则
  
    标识符仅使用 ASCII 字母和数字, 和少数情况下的、下划线```_```和美元符号```$```

    在合理范围内尽可能给出描述性的名称, 不要担心担心标识符的长度，因为让新读者立即理解代码更为重要, 不要使用项目外的读者不熟悉的缩写，也不要通过删除单词中的字母来进行缩写

    ```javascript
    errorCount          // No abbreviation.
    dnsConnectionIndex  // Most people know what "DNS" stands for.
    referrerUrl         // Ditto for "URL".
    customerId          // "Id" is both ubiquitous and unlikely to be misunderstood.
    ```

    不好的:
    ```javascript
    n                   // Meaningless.
    nErr                // Ambiguous abbreviation.
    nCompConns          // Ambiguous abbreviation.
    wgcConnections      // Only your group knows what this stands for.
    pcReader            // Lots of things can be abbreviated "pc".
    cstmrId             // Deletes internal letters.
    kSecondsPerDay      // Do not use Hungarian notation.
    ```
- 包名
  
    包名使用小驼峰```lowerCamelCase```, 例: ```my.exampleCode.deepSpace```
- 类名
  
    类、接口、类型定义使用大驼峰```UpperCamelCase```, 例: ```Request```, ```ImmutableList```, ```VisibilityMode```
- 方法名
  
    方法使用小驼峰```lowerCamelCase```, 
    方法名称通常是动词或动词短语, 例: ```sendMessage```, ```stop```

- 常量名

    常量名使用```CONSTANT_CASE```: 所有字母大写, 下划线```_```分割单词

- 参数名
  
    参数名使用小驼峰```lowerCamelCase```

- 局部变量名
  
    局部变量名使用小驼峰```lowerCamelCase```
- CSS命名

    [采用BEM命名规范](https://en.bem.info/methodology/quick-start/)
## Vue
- 风格指南

    参考[官方指南](https://v3.cn.vuejs.org/style-guide)

## 自动化测试
- 通用组件统一
  
    UI、及常用业务组件统一、复用一套组件，避免重复轮子造成的不一致问题

- 输出模板结构

    输出DOM结构保证语义化、避免结构不清、及混乱的DOM结构
    

## 相关工具
- [Eslint](https://eslint.org/) - 提供eslint 编码提示及修复工具
- [Vetur](https://vuejs.github.io/vetur/) - Vue 开发工具, 语法高亮, 智能语法 Debug
- [Prettier](https://prettier.io/) - 格式化工具
- [EditorConfig for VS Code](https://editorconfig.org/) - EditorConfig 集成工具
